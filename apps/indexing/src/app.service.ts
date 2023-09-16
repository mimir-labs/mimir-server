// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { BlockHash } from '@polkadot/types/interfaces';
import type { Repository } from 'typeorm';

import { ApiService, mimirConfig, sleep } from '@mimir/common';
import { Blockchain } from '@mimir/db';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(private eventEmitter: EventEmitter2, private apiService: ApiService, @InjectRepository(Blockchain) private blockchainRepository: Repository<Blockchain>) {
    Object.keys(mimirConfig.chains).forEach((key) => {
      this.startScan(this.apiService.get(key));
    });
  }

  private async startScan(api: ApiPromise) {
    await api.isReady;
    const chainName = (await api.rpc.system.chain()).toString();

    if (!(await this.blockchainRepository.exist({ where: { chainName } }))) {
      const blockHash = await api.rpc.chain.getFinalizedHead();
      const header = await api.rpc.chain.getHeader(blockHash);

      await this.blockchainRepository.insert({
        chainName,
        syncedBlock: header.number.toString(),
        finalizedBlock: header.number.toString(),
        blockHash: header.hash.toHex()
      });
    }

    const blockchain = await this.blockchainRepository.findOneByOrFail({ chainName });

    api.rpc.chain.subscribeFinalizedHeads((header) => {
      this.blockchainRepository.update(blockchain.id, {
        finalizedBlock: header.number.toString()
      });
    });

    this.scan(chainName, api);
  }

  private async scan(chainName: string, api: ApiPromise) {
    while (true) {
      if (!api.isConnected) {
        console.warn('api disconnect, wait 3s to restore');
        await sleep(3000);
        continue;
      }

      const blockchain = await this.blockchainRepository.findOneByOrFail({ chainName });

      if (BigInt(blockchain.finalizedBlock) <= BigInt(blockchain.syncedBlock)) {
        await sleep(3000);

        continue;
      }

      const blockNumber = BigInt(blockchain.syncedBlock) + 1n;

      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);

      const [allRecords, block] = await Promise.all([this.retrieveEvents(api, blockHash), api.rpc.chain.getBlock(blockHash)]);

      for (let index = 0; index < block.block.extrinsics.length; index++) {
        const { hash } = block.block.extrinsics[index];
        // filter the specific events based on the phase and then the
        // index of our extrinsic in the block
        const events = allRecords
          .filter(({ event, phase }) => {
            return (
              phase.isApplyExtrinsic &&
              phase.asApplyExtrinsic.eq(index) &&
              (api.events.multisig.NewMultisig.is(event) ||
                api.events.multisig.MultisigApproval.is(event) ||
                api.events.multisig.MultisigExecuted.is(event) ||
                api.events.multisig.MultisigCancelled.is(event))
            );
          })
          .map(({ event }) => event);

        events.forEach((event) => {
          console.log(
            `retrive event: ${event.section}.${event.method}`,
            '::',
            `blockHash: ${blockHash.toHex()}, blockNumber: ${blockNumber.toString()}`,
            '::',
            `extrinsicHash: ${hash.toHex()}, extrinsicIndex: ${index}`
          );
        });

        if (events.length > 0) {
          await this.eventEmitter.emitAsync(
            'multisig.event',
            chainName,
            events.map((event) => ({
              event,
              blockHash: blockHash.toHex(),
              blockNumber: blockNumber.toString(),
              extrinsicHash: hash.toHex(),
              extrinsicIndex: index
            }))
          );
        }
      }

      await this.blockchainRepository.update(blockchain.id, {
        syncedBlock: blockNumber.toString(),
        blockHash: blockHash.toHex()
      });
    }
  }

  private async retrieveEvents(api: ApiPromise, blockHash: BlockHash) {
    return (await api.at(blockHash)).query.system.events();
  }
}

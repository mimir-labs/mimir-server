// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { ApiService } from '@mimir/common';
import { Accounts, BaseMultisig, Calldata } from '@mimir/db';
import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { createKeyMulti, decodeAddress } from '@polkadot/util-crypto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
    private apiService: ApiService,
    @InjectRepository(Calldata) private calldataRepository: Repository<Calldata>,
    @InjectRepository(Accounts) private accountsRepository: Repository<Accounts>
  ) {}

  public async getTransactions(chainName: string, address: string): Promise<BaseMultisig[]> {
    const Entity = this.apiService.getMultisigEntity(chainName);

    const repository = this.dataSource.getRepository(Entity);

    const multisigAccount = u8aToHex(decodeAddress(address));

    const results = await repository.find({
      where: {
        multisigAccount
      },
      order: {
        blockNumber: 'desc'
      }
    });

    return results;
  }

  public async createCalldata(calldata: HexString): Promise<void> {
    const call = this.apiService.getDefault().registry.createType('Call', calldata);

    if (!(await this.calldataRepository.exist({ where: { id: call.hash.toHex() } }))) {
      await this.calldataRepository.insert({
        id: call.hash.toHex(),
        data: call.toHex()
      });
    }
  }

  public async calldata(callhash: HexString): Promise<Calldata | null> {
    return this.calldataRepository.findOne({
      where: { id: callhash }
    });
  }

  public async createMultisig(name: string, threshold: number, who: string[], address: string): Promise<void> {
    const whoU8a = who.map((item) => decodeAddress(item));
    const addressU8a = decodeAddress(address);

    if (!u8aEq(createKeyMulti(whoU8a, threshold), addressU8a)) {
      throw new PreconditionFailedException('multisig address not right');
    }

    if (await this.accountsRepository.exist({ where: { address: u8aToHex(addressU8a) } })) {
      return;
    }

    await this.accountsRepository.insert({
      name,
      address: u8aToHex(addressU8a),
      threshold,
      who: whoU8a.map((item) => u8aToHex(item))
    });
  }

  public async getMultisig(address: string): Promise<Accounts[]> {
    const addressHex = u8aToHex(decodeAddress(address));

    return this.accountsRepository.createQueryBuilder('accounts').where(`accounts.who @> '["${addressHex}"]'::jsonb`).getMany();
  }
}

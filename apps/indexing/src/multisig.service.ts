// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiService } from '@mimir/common';
import { MultisigStatus } from '@mimir/db/entity/multisig';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from '@polkadot/types/interfaces';
import { HexString } from '@polkadot/util/types';
import { DataSource } from 'typeorm';

type MultisigEvents = {
  event: Event;
  blockHash: HexString;
  blockNumber: string;
  extrinsicHash: HexString;
  extrinsicIndex: number;
};

@Injectable()
export class MultisigService {
  constructor(private dataSource: DataSource, private apiService: ApiService) {}

  @OnEvent('multisig.event')
  protected async onMultisigEvents(chainName: string, events: MultisigEvents[]) {
    const Entity = this.apiService.getMultisigEntity(chainName);

    const repository = this.dataSource.getRepository(Entity);

    for (const { blockHash, blockNumber, event, extrinsicHash, extrinsicIndex } of events) {
      const api = this.apiService.get(chainName);

      if (api.events.multisig.NewMultisig.is(event)) {
        await repository.insert({
          blockNumber,
          blockHash,
          extrinsicHash,
          extrinsicIndex,
          section: event.section,
          method: event.method,
          multisigAccount: event.data.multisig.toHex(),
          depositor: event.data.approving.toHex(),
          approvedAccounts: [event.data.approving.toHex()],
          callhash: event.data.callHash.toHex(),
          status: MultisigStatus.Created
        });
      } else if (api.events.multisig.MultisigApproval.is(event)) {
        const multisigs = await repository.find({ where: { callhash: event.data.callHash.toHex(), multisigAccount: event.data.multisig.toHex(), status: MultisigStatus.Created } });

        await repository.save(
          multisigs.map((item) => {
            item.approvedAccounts = [...item.approvedAccounts, event.data.approving.toHex()];

            return item;
          })
        );
      } else if (api.events.multisig.MultisigExecuted.is(event)) {
        const multisigs = await repository.find({ where: { callhash: event.data.callHash.toHex(), multisigAccount: event.data.multisig.toHex(), status: MultisigStatus.Created } });

        await repository.save(
          multisigs.map((item) => {
            item.approvedAccounts = [...item.approvedAccounts, event.data.approving.toHex()];
            item.status = MultisigStatus.Executed;

            return item;
          })
        );
      } else if (api.events.multisig.MultisigCancelled.is(event)) {
        const multisigs = await repository.find({ where: { callhash: event.data.callHash.toHex(), multisigAccount: event.data.multisig.toHex(), status: MultisigStatus.Created } });

        await repository.save(
          multisigs.map((item) => {
            item.cancelledAccount = event.data.cancelling.toHex();
            item.status = MultisigStatus.Cancelled;

            return item;
          })
        );
      }
    }
  }
}

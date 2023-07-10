// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Column, PrimaryGeneratedColumn } from 'typeorm';

export enum MultisigStatus {
  Created,
  Executed,
  Cancelled
}

export abstract class BaseMultisig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint', { name: 'block_number', nullable: false })
  blockNumber: string;

  @Column('varchar', { name: 'block_hash', nullable: false })
  blockHash: HexString;

  @Column('varchar', { name: 'extrinsic_hash', nullable: false })
  extrinsicHash: HexString;

  @Column('int8', { name: 'extrinsic_index', nullable: false })
  extrinsicIndex: number;

  @Column('varchar', { name: 'section', nullable: false })
  section: string;

  @Column('varchar', { name: 'method', nullable: false })
  method: string;

  @Column('varchar', { name: 'multisig_account', nullable: false })
  multisigAccount: HexString;

  @Column('varchar', { name: 'depositor', nullable: false })
  depositor: HexString;

  @Column('jsonb', { name: 'approved_accounts', nullable: false })
  approvedAccounts: HexString[];

  @Column('varchar', { name: 'cancelled_accounts', nullable: true })
  cancelledAccount?: HexString | null;

  @Column('varchar', { name: 'callhash', nullable: false })
  callhash: HexString;

  @Column('enum', { name: 'status', nullable: false, enum: MultisigStatus })
  status: MultisigStatus;
}

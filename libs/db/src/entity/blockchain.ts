// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HexString } from '@polkadot/util/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blockchain')
export class Blockchain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'chain_name', nullable: false, unique: true })
  chainName: string;

  @Column('bigint', { name: 'synced_block', nullable: false })
  syncedBlock: string;

  @Column('bigint', { name: 'finalized_block', nullable: false })
  finalizedBlock: string;

  @Column('varchar', { name: 'block_hash', nullable: false })
  blockHash: HexString;
}

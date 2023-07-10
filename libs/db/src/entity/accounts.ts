// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('accounts')
export class Accounts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'address', nullable: false })
  address: HexString;

  @Column('int', { name: 'threshold', nullable: false })
  threshold: number;

  @Column('jsonb', { name: 'who', nullable: false })
  who: HexString[];

  @Column('varchar', { name: 'name', nullable: false })
  name: string;
}

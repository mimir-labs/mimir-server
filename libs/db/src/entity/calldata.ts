// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('calldata')
export class Calldata {
  @PrimaryColumn('varchar')
  id: HexString;

  @Column('varchar', { name: 'data', nullable: false })
  data: HexString;
}

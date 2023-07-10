// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'reflect-metadata';

import { mimirConfig } from '@mimir/common';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

import { allEntity } from './entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: mimirConfig.db.host,
  port: mimirConfig.db.port,
  username: mimirConfig.db.username,
  password: mimirConfig.db.password,
  database: mimirConfig.db.database,
  synchronize: false,
  logging: false,
  entities: allEntity,
  migrations: [resolve(__dirname, 'migrations', '*')],
  subscribers: []
});

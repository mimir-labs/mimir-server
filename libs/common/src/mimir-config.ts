// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'fs';

interface DBConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface ChainConfig {
  endpoint: string;
}

export interface MimirConfig {
  db: DBConfig;
  chains: Record<string, ChainConfig>;
}

// load mimir config
const content = JSON.parse(readFileSync('.mimir.config', { encoding: 'utf8' }));

export const mimirConfig: MimirConfig = {
  db: {
    host: content?.db?.host || 'localhost',
    port: content?.db?.port || 5432,
    username: content?.db?.username || 'postgres',
    password: content?.db?.password || 'postgres',
    database: content?.db?.database || 'mimir'
  },
  chains: content?.chains
};

// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BaseMultisig } from '@mimir/db';
import { Injectable } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Entity } from 'typeorm';

import { mimirConfig } from '../mimir-config';

@Injectable()
export class ApiService {
  #apis: Map<string, ApiPromise> = new Map();
  #entities: Map<string, { new (): BaseMultisig }> = new Map();

  constructor() {
    Object.entries(mimirConfig.chains).forEach(([key, chain]) => {
      this.#apis.set(key, this.createApi(chain.endpoint));
    });
  }

  private createApi(apiUrl: string): ApiPromise {
    const provider = new WsProvider(apiUrl);

    const api = new ApiPromise({ provider });

    return api;
  }

  public get(key: string): ApiPromise {
    const api = this.#apis.get(key);

    if (!api) throw new Error('Api not found');

    return api;
  }

  public getDefault(): ApiPromise {
    const api = Array.from(this.#apis.values())[0];

    if (!api) throw new Error('Api not found');

    return api;
  }

  public async getMultisigEntities() {
    const chains = await Promise.all(Array.from(this.#apis.values()).map((api) => api.isReady.then((api) => api.rpc.system.chain())));

    chains.forEach((chain) => {
      @Entity(`multisig-events:${chain.toString()}`)
      class MultisigEntity extends BaseMultisig {}

      this.#entities.set(chain.toString(), MultisigEntity);
    });

    return Array.from(this.#entities.values());
  }

  public getMultisigEntity(name: string) {
    const Entity = this.#entities.get(name);

    if (!Entity) throw new Error('entity not found');

    return Entity;
  }
}

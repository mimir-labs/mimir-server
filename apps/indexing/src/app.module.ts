// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiModule, ApiService, mimirConfig } from '@mimir/common';
import { allEntity } from '@mimir/db';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { MultisigService } from './multisig.service';

export function createAppModule() {
  @Module({
    imports: [
      ApiModule,
      EventEmitterModule.forRoot(),
      TypeOrmModule.forRootAsync({
        imports: [ApiModule],
        inject: [ApiService],
        useFactory: async (apiService: ApiService) => ({
          type: 'postgres',
          host: mimirConfig.db.host,
          port: mimirConfig.db.port,
          username: mimirConfig.db.username,
          password: mimirConfig.db.password,
          database: mimirConfig.db.database,
          entities: [...allEntity, ...(await apiService.getMultisigEntities())],
          synchronize: true
        })
      }),
      TypeOrmModule.forFeature(allEntity)
    ],
    controllers: [],
    providers: [AppService, MultisigService]
  })
  class AppModule {}

  return AppModule;
}

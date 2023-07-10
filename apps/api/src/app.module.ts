// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiModule, ApiService, mimirConfig } from '@mimir/common';
import { allEntity } from '@mimir/db';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ApiModule,
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
    TypeOrmModule.forFeature(allEntity),
    ClientsModule.register([
      {
        name: 'indexing',
        transport: Transport.TCP,
        options: {
          port: 8082
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

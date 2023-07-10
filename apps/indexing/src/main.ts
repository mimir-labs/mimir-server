// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MicroserviceOptions } from '@nestjs/microservices';

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { createAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(createAppModule(), {
    transport: Transport.TCP,
    options: {
      port: 8081
    }
  });

  await app.listen();
}

bootstrap();

// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(8080);
}

bootstrap();

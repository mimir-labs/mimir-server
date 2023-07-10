// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Module } from '@nestjs/common';

import { ApiService } from './api.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ApiService],
  exports: [ApiService]
})
export class ApiModule {}

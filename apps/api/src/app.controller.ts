// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Accounts, BaseMultisig, Calldata } from '@mimir/db';
import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseArrayPipe, ParseIntPipe, Post, Query } from '@nestjs/common';
import { HexString } from '@polkadot/util/types';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/transactions')
  @HttpCode(HttpStatus.OK)
  public transactions(@Query('chain_name') chainName: string, @Query('address') address: string): Promise<BaseMultisig[]> {
    return this.appService.getTransactions(chainName, address);
  }

  @Post('/calldata')
  @HttpCode(HttpStatus.CREATED)
  public async addCalldata(@Body('calldata') calldata: HexString): Promise<{ success: boolean }> {
    await this.appService.createCalldata(calldata);

    return { success: true };
  }

  @Get('/calldata/:callhash')
  @HttpCode(HttpStatus.OK)
  public async getCalldata(@Param('callhash') callhash: HexString): Promise<Calldata> {
    const calldata = await this.appService.calldata(callhash);

    if (!calldata) throw new NotFoundException(`Can not find calldata with hash(${callhash})`);

    return calldata;
  }

  @Post('/multisig')
  @HttpCode(HttpStatus.CREATED)
  public async createMultisig(
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('who', ParseArrayPipe) who: string[],
    @Body('threshold', ParseIntPipe) threshold: number
  ): Promise<{ success: boolean }> {
    await this.appService.createMultisig(name, threshold, who, address);

    return { success: true };
  }

  @Get('/multisig')
  @HttpCode(HttpStatus.OK)
  public async getMultisig(@Query('address') address: string): Promise<Accounts[]> {
    return this.appService.getMultisig(address);
  }
}

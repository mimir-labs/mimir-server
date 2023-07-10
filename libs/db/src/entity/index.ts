// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/api-augment/substrate';

import { Accounts } from './accounts';
import { Blockchain } from './blockchain';
import { Calldata } from './calldata';
import { BaseMultisig } from './multisig';

export const allEntity = [Accounts, Blockchain, Calldata];

export { Accounts, Blockchain, BaseMultisig, Calldata };

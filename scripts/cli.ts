// Copyright 2023-2023 jarvandev authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function main() {
  await yargs(hideBin(process.argv))
    .scriptName('mimir')
    .usage('$0 <cmd> [args]')
    .wrap(null)
    .command(
      'db:generate [filename]',
      'Generate db migration files',
      (argv) => {
        return argv.positional('filename', {
          describe: 'filename of migration file'
        });
      },
      (args) => {
        execSync(`ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:generate -d libs/db/src/data-source.ts libs/db/src/migrations/${args.filename}`, { stdio: 'inherit' });
      }
    )
    .command('db:run', 'run all migration file', () => {
      execSync('ts-node -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run -d libs/db/src/data-source.ts', { stdio: 'inherit' });
    })
    .demandCommand(1, 'You must provide a valid command.')
    .help()
    .version(false)
    .strict().argv;
}

main().catch(console.error);

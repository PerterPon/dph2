/*
  mock
  Author: PerterPon<PerterPon@gmail.com>
  Create: Sun Jun 17 2018 14:58:36 GMT+0800 (CST)
*/

import * as commander from 'commander';

import { initConfig } from 'src/core/config';
import * as Util from 'src/core/util';
import { initLogger, getLogger } from 'src/core/log';
import { pullUpMaster } from './master';

import { ProcessName } from 'src/enums/main';

import { Logger } from 'log4js';
import { TDPHConfig } from 'main-types';

commander
    .option( '-v, --env', 'running env' )
    .parse( process.argv );

async function main(): Promise<void> {
    const dphConfig: TDPHConfig = await initConfig( commander.env );
    initLogger( dphConfig, ProcessName.MASTER );
    await initOutFolder();
    await pullUpMaster();
}

async function initOutFolder(): Promise<void> {
    const outPath: string = Util.getOutFolderPath();
    await Util.mkdirp( outPath );
}

main();

process.on( 'uncaughtException', ( error: Error ) => {
    const logger: Logger = getLogger();
    logger.error( `uncaught exception\n${error.message}\n${error.stack}` );
} );

process.on( 'unhandledRejection', ( reason: any, promise: Promise<any> ) => {
    const logger: Logger = getLogger();
    logger.error( `unhandled rejection, reason: [${ reason }]` );
} );

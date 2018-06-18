/*
* Master
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 10:36:56 GMT+0800 (CST)
*/

import * as childProcess from 'child_process';
import * as net from 'net';
import * as path from 'path';

import { getLogger } from 'src/core/log';
import { fetchCurrentConfig } from 'src/core/config';
import * as Util from 'src/core/util';
import { IPCHandler } from 'src/core/ipc-handler';

import { IPCEvent } from 'src/enums/util';
import { ProcessName } from 'src/enums/main';

import { Logger } from 'log4js';
import { TDPHConfig, TProcessRegister, TProcessConfig } from 'main-types';
import { IPCStruct } from 'util-types';

const logger: Logger = getLogger();

export async function pullUpMaster(): Promise<void> {
    await listen();
    await pullUpSubprocess( 'main' );
}

async function pullUpSubprocess( name: string ): Promise<void> {

    const workerPath: string = Util.getWorkersFolderPath();
    const config: TDPHConfig = await fetchCurrentConfig();
    const processConfig: TProcessConfig = config.ipc[ name ];
    const targetFile: string = path.join( workerPath, processConfig.file );

    // debugger;
    const forkOptions: childProcess.ForkOptions = {
        silent: false
    };
    const subProcess: childProcess.ChildProcess = childProcess.fork( `${ targetFile }.js`, [], forkOptions );
    // subProcess.stdout.pipe( process.stdout );
}

async function listen(): Promise<void> {
    const config: TDPHConfig = await fetchCurrentConfig();
    const sockPath: string = Util.getMasterSockPath( <string>config.ipc.master.sock );

    const app = net.createServer( ( socket: net.Socket ) => {

        socket.on( 'close', ( had_error: boolean ) => {
            logger.error( `A UDS connection was disconnected!, has error: [${ had_error }]` );
        } );

        socket.on( 'data', ( data: Buffer ) => {
            
            const dataContent: string = data.toString();
            const jsonData: IPCStruct<any> = JSON.parse( dataContent );
            dealIPC( jsonData );

        } );

        socket.on( 'connect', () => {
            logger.debug( `got a uds connection` );
        } );

    } );

    app.listen( sockPath );

}

async function dealIPC<T>( data: IPCStruct<T> ): Promise<void> {
    try {
        const IPCData: any = IPCHandler( data );
        const { event } = data;
        if ( IPCEvent.REGISTER_PROCESS === event ) {
            await dealProcessRegister( IPCData as TProcessRegister );
        }
    } catch ( e ) {
        logger.error( `parse ipc data error: [${ e.message }] \n${ e.stack }` );
    }
}

async function dealProcessRegister( data: TProcessRegister ): Promise<void> {
    const name: ProcessName = data.name;
    logger.info( `process: [${ name }] has registered to master!` );
}


/*
* Master
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 10:36:56 GMT+0800 (CST)
*/

import * as childProcess from 'child_process';
import * as net from 'net';
import * as path from 'path';

import { getLogger } from 'src/core/log';
import { getConfig } from 'src/core/config';
import * as Util from 'src/core/util';
import { IPCBufferHandler, IPCHandler, IPCBufferWrapper } from 'src/core/ipc-handler';

import { IPCEvent } from 'src/enums/util';
import { ProcessName } from 'src/enums/main';

import { Logger } from 'log4js';
import { TDPHConfig, TProcessRegister, TProcessConfig } from 'main-types';
import { IPCStruct } from 'util-types';
import { Socket } from 'net';

export async function pullUpMaster(): Promise<void> {
    await listen();
    await pullUpSubprocess( ProcessName.MAIN );
    await pullUpSubprocess( ProcessName.POLLING );
}

const sockMap: Map<string, Socket> = new Map();

async function pullUpSubprocess( name: string ): Promise<void> {

    const logger: Logger = getLogger();
    const workerPath: string = Util.getWorkersFolderPath();
    const config: TDPHConfig = await getConfig();
    const processConfig: TProcessConfig = config.ipc[ name ];
    const targetFile: string = path.join( workerPath, processConfig.file );
    const subArgv: Array<string> = process.argv.slice();
    subArgv.unshift();
    subArgv.unshift();

    let subProcess: childProcess.ChildProcess = childProcess.fork( `${ targetFile }.js`, subArgv );
    subProcess.once( 'exit', ( code: string, single: string ) => {
        logger.error( `process: [${ name }] down! repulling up...` );
        setTimeout( () => {
            pullUpSubprocess( name );
        }, 5 * 1000 );
    } );
}

async function listen(): Promise<void> {
    const config: TDPHConfig = await getConfig();
    const sockPath: string = Util.getMasterSockPath( <string>config.ipc.master.sock );

    const logger: Logger = getLogger();

    const app = net.createServer( ( socket: Socket ) => {

        socket.on( 'close', ( had_error: boolean ) => {
            logger.error( `A UDS connection was disconnected!, has error: [${ had_error }]` );
        } );

        socket.on( 'data', ( data: Buffer ) => {
            const IPCData: IPCStruct<any> = IPCBufferHandler( data );
            IPCHandler( IPCData );
            dealIPC( IPCData, socket );
        } );

        socket.on( 'connect', () => {
            logger.debug( `got a uds connection` );
        } );

    } );

    app.listen( sockPath );
}

async function dealIPC( data: IPCStruct<any>, sock: Socket ): Promise<void> {
    const logger: Logger = getLogger();
    try {
        const { event } = data;
        if ( IPCEvent.REGISTER_PROCESS === event ) {
            await dealProcessRegister( data.data as TProcessRegister, sock );
        }
    } catch ( e ) {
        logger.error( `parse ipc data error: [${ e.message }] \n${ e.stack }` );
    }
}

async function dealProcessRegister( data: TProcessRegister, sock: Socket ): Promise<void> {
    const logger: Logger = getLogger();
    const name: ProcessName = data.name;
    logger.info( `process: [${ name }] has registered to master!` );
    sockMap.set( name, sock );
    await doStartWorker( name );
}

async function doStartWorker( name: string ): Promise<void> {
    const workingData: Buffer = IPCBufferWrapper( name, IPCEvent.START_WORKER );
    const sock: Socket|undefined = sockMap.get( name );
    if ( undefined === sock ) {
        const error: Error = new Error( `trying to start worker: [${ name }], but can not found the socket!` );
        throw error;
    }
    const result: boolean = sock.write( workingData );
    if ( false === result ) {
        const error: Error = new Error( `trying to sending start worker single to: [${ name }], but failed!` );
        throw error;
    }
}

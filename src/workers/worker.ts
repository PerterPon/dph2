/*
* Worker
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import * as commander from 'commander';
import * as net from 'net';

import * as Util from 'src/core/util';
import { initExchanges } from 'src/core/exchange';
import { initLogger, getLogger } from 'src/core/log';
import { initConfig, getConfig } from 'src/core/config';
import { ProcessName } from 'src/enums/main';
import { IPCBufferHandler, IPCBufferWrapper, IPCHandler } from 'src/core/ipc-handler';
import { initDb } from 'src/core/db';

import { TDPHConfig, TProcessRegister } from 'main-types';
import { Logger } from 'log4js';
import { IPCEvent } from '../enums/util';
import { IPCStruct } from 'util-types';

export abstract class Worker {

    /**名称 */
    public name: ProcessName = ProcessName.UNKNOW;
    /**socket客户端 */
    protected client: net.Socket = new net.Socket();

    public async init(): Promise<void> {
        await this.parseConfig();
        this.initLogger();
        await this.initExchanges();
        
        const logger: Logger = getLogger();
        logger.info( `process: [${ this.name }] init success.` );

        // all init done, register to master
        this.connectMaster();
    }

    protected async parseConfig(): Promise<void> {
        commander.parse( process.argv );
        await initConfig( commander.env );
    }

    /**
     * do connect master
     */
    protected async connectMaster(): Promise<void> {
        const config: TDPHConfig = getConfig();
        const masterSockPath: string = Util.getMasterSockPath( <string>config.ipc.master.sock );
        const client = this.client;
        client.connect( masterSockPath );
        client.once( 'connect', this.onConnectMaster.bind( this ) );
        client.once( 'close', this.onConnectError.bind( this ) );
        client.once( 'error', this.onConnectError.bind( this ) );
        client.on( 'data', this.onMasterData.bind( this ) );
    }

    /**
     * init logger
     */
    protected initLogger(): void {
        const config: TDPHConfig = getConfig();
        initLogger( config, this.name );
    }

    /**
     * init db
     */
    protected async initDb(): Promise<void> {
        const config: TDPHConfig = getConfig();
        initDb( config.database );
    }

    /**
     * init all exchanges
     */
    protected async initExchanges(): Promise<void> {
        const log: Logger = getLogger();
        log.info( `initing exchanges ...` );
        const config: TDPHConfig = getConfig();
        await initExchanges( config );
    }

    /**
     * worker entry
     */
    protected async start(): Promise<void> {
        // start worker here
    }

    /**
     * send message to master
     * @param event 
     * @param data 
     */
    protected sendMessage( event: IPCEvent, data: any ): boolean {
        const sendingData: Buffer = IPCBufferWrapper( data, event );
        const result: boolean =  this.client.write( sendingData );
        return result;
    }

    /**
     * message from master
     * @param event 
     * @param data 
     */
    protected onMasterEvent( event: IPCEvent, data: any ): void {
        // deal your event from master here
    }

    /**
     * connect master
     */
    private onConnectMaster(): void {
        const registerData: TProcessRegister = {
            name: this.name
        };
        const registerBuffer: Buffer = IPCBufferWrapper( registerData, IPCEvent.REGISTER_PROCESS );
        this.client.write( registerBuffer );
    }

    /**
     * 
     * @param error 
     */
    private onConnectError( error: Error ): void {
        const logger: Logger = getLogger();
        logger.error( `${error.message}\n--------------\n${error.stack}` );
    }

    /**
     * on master ipc message
     * @param data
     */
    private onMasterData( data: Buffer ): void {
        const IPCMessage: IPCStruct<any> = IPCBufferHandler( data );
        IPCHandler( IPCMessage );
        if ( IPCEvent.START_WORKER === IPCMessage.event ) {
            this.start();
        } else {
            this.onMasterEvent( IPCMessage.event, IPCMessage.data );
        }
    }

}

process.on( 'uncaughtException', ( error: Error ) => {
    const logger: Logger = getLogger();
    logger.error( `uncaught exception\n${ error.message }\n${ error.stack }` );
} );

process.on( 'unhandledRejection', ( reason: any, promise: Promise<any> ) => {
    const logger: Logger = getLogger();
    logger.error( `unhandled rejection, reason: [${ reason }]` );
    console.log( reason, promise );
} );


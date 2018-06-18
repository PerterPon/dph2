/*
* Worker
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import * as commander from 'commander';
import * as net from 'net';

import * as Util from 'src/core/util';
import { initLogger } from 'src/core/log';
import { ProcessName } from 'src/enums/main';
import { IPCWrapper } from 'src/core/ipc-handler';

import { TDPHConfig, TProcessRegister } from 'main-types';
import { Logger } from 'log4js';
import { IPCEvent } from '../enums/util';

export abstract class Worker {

    /**名称 */
    public name: ProcessName = ProcessName.UNKNOW;
    /**日志对象 */
    protected logger: Logger = {} as Logger;
    /**配置信息 */
    protected config: TDPHConfig = {} as TDPHConfig;
    /**socket客户端 */
    protected client: net.Socket = new net.Socket();

    public async init(): Promise<void> {
        await this.parseConfig();
        this.initLogger();
        this.connectMaster();
    }

    protected async parseConfig(): Promise<void> {
        commander.parse( process.argv );
        const config: TDPHConfig = await Util.parseDPHConfig( commander.env );
        this.config = config;
    }

    protected connectMaster(): void {
        const masterSockPath: string = Util.getMasterSockPath( <string>this.config.ipc.master.sock );
        const client = this.client;
        client.connect( masterSockPath );
        client.once( 'connect', this.onConnectMaster.bind( this ) );
        client.once( 'close', this.onConnectError.bind( this ) );
        client.once( 'error', this.onConnectError.bind( this ) );
    }

    protected initLogger(): void {
        const { config } = this;

        const logger: Logger = initLogger( config, this.name );
        this.logger = logger;
    }

    private onConnectMaster(): void {
        const registerData: TProcessRegister = {
            name: this.name
        };
        const registerBuffer: Buffer = IPCWrapper( registerData, IPCEvent.REGISTER_PROCESS );
        this.client.write( registerBuffer );
    }

    private onConnectError( error: Error ): void {
        this.logger.error( `${error.message}\n--------------\n${error.stack}` );
    }

}

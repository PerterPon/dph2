/*
* Main
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import { Worker } from './worker';
import { getConfig } from 'src/core/config';
import { initExchanges } from 'src/core/exchange';
import { getLogger } from 'src/core/log';
import { ProcessName } from 'src/enums/main';

import { TDPHConfig } from 'main-types';
import { Logger } from 'log4js';

export class MainWorker extends Worker {
    public name: ProcessName = ProcessName.MAIN;

    // overwrite
    protected async start(): Promise<void> {
        const log: Logger = getLogger();
        log.info( `worker: [${ this.name }] got work single from master, start working ...` );
        await this.initExchanges();
    }

    /**
     * init all exchanges
     */
    protected async initExchanges(): Promise<void> {
        const config: TDPHConfig = getConfig();
        await initExchanges( config );
    }

}

async function start(): Promise<void> {
    const main: MainWorker = new MainWorker();
    await main.init();
}

start();

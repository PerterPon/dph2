/*
* Polling
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import { Worker } from './worker';

import { ProcessName } from 'src/enums/main';

export class PollingWorker extends Worker {

    public name: ProcessName = ProcessName.POLLING;

    

}

async function start(): Promise<void> {
    const polling: PollingWorker = new PollingWorker();
    await polling.init();

}

start();

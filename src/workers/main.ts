/*
* Main
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import { Worker } from './worker';

export class MainWorker extends Worker {

    

}

async function start(): Promise<void> {
    const main: MainWorker = new MainWorker();
    await main.init();
    setTimeout( () => {

    }, 1000000000 );
}

start();

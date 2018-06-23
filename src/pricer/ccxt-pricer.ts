/*
* CCXT-PRICER
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Wed Jun 20 2018 07:55:14 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';

import { BasePricer } from './base-pricer';

import { Exchange, Market } from 'ccxt';

export class CCXTPricer extends BasePricer {
    
    constructor() {
        super();
        this.start();
    }

    private async start(): Promise<void> {
        const exchange: Exchange = new ccxt.bitfinex2();
        console.log( ccxt.exchanges, exchange );
    }

}

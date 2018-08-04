
/*
* base-strategy
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 25 2018 11:25:57 GMT+0800 (CST)
*/

import { TTradeActions } from 'trader-types';
import { StandardCoin, DPHCoin, DPHExchange, StrategyType } from '../enums/main';
import { OrderBook } from 'ccxt';

export interface DStrategy {
    newActions( actions:TTradeActions ):void;
}

export abstract class BaseStrategy {

    public delegate: DStrategy|null = null;

    protected strategyType: StrategyType = StrategyType.UNKNOW;

    protected strategyConfig: {
        [name: string] : any
    } = {};

    constructor( config: { [name: string] : any } ) {
        this.strategyConfig = config;
    }

    public async init():Promise<void> {

    }

    public updateOrderBook( standardCoin: StandardCoin, coin: DPHCoin, exchangeName: DPHExchange, orderBook: OrderBook ): void {
        throw new Error( `you must implement method: [updateOrderBook] for strategy:[${ ( <any>this ).__proto__.constructor.name }]` );
    }

}

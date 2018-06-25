
/*
* th-strategy
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 25 2018 11:35:50 GMT+0800 (CST)
*/

import { BaseStrategy } from './base-strategy';

import { TTradeActions } from 'trader-types';
import { StandardCoin, DPHCoin, DPHExchange } from '../enums/main';
import { OrderBook } from 'ccxt';

export class THStrategy extends BaseStrategy {

    public async updateOrderBook( standardCoin: StandardCoin, coin: DPHCoin, exchangeName: DPHExchange, orderBook: OrderBook ): Promise<TTradeActions | null> {

        console.log( standardCoin, coin, exchangeName, orderBook );

        return new Promise<TTradeActions|null>( ( resolve, reject ) => {



        } );

    }

}


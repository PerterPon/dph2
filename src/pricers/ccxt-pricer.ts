/*
* ccxt-pricer
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Wed Jun 20 2018 07:55:14 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';

import { getExchange } from 'src/core/exchange';
import { BasePricer } from './base-pricer';

import { StandardCoin } from '../enums/main';

import { Exchange, OrderBook } from 'ccxt';
import { TExchange, TMarkets } from 'exchange-types';
import { Logger } from 'log4js';
import { getLogger } from '../core/log';
import { TExchangeConfig } from 'main-types';
import { TPricerSymbols } from 'pricer-types';

export class CCXTPricer extends BasePricer {

    public async fetchOrderBook( standardCoin: StandardCoin, coin: string ): Promise<OrderBook|null> {
        const log: Logger = getLogger();
        const exchangeInfo: TExchange = getExchange( this.name );
        const config: TExchangeConfig = this.exchangeConfig;
        let symbols: TPricerSymbols = {};

        if ( standardCoin === StandardCoin.USD ) {
            symbols = config.USDSymbols;
        } else if ( standardCoin === StandardCoin.BTC ) {
            // throw new Error( `standard coin: [ ${ StandardCoin.BTC } ] is not support yet!` );
            // TODO: later support
            symbols = config.BTCSymbols;
        }

        const symbol: string = symbols[ coin ];
        const markets: TMarkets = exchangeInfo.markets;
        // if symbol not exists in market, just return; 
        if ( false === symbol in markets ) {
            return null;
        }

        const exchange: Exchange = exchangeInfo.exchange;
        const orderBook: OrderBook = await exchange.fetchOrderBook( symbol );
        return orderBook;
    }

}

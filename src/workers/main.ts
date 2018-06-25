/*
* Main
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import { getConfig } from 'src/core/config';
import { getLogger } from 'src/core/log';
import { ProcessName, StandardCoin, DPHExchange } from 'src/enums/main';
import { BasePricer } from 'src/pricers/base-pricer';
import { CCXTPricer } from 'src/pricers/ccxt-pricer';
import { Worker } from './worker';

import { DPHCoin } from 'src/enums/main';

import { TDPHConfig, TExchangeConfig } from 'main-types';
import { Logger } from 'log4js';
import { TExchange } from 'exchange-types';
import { TPricerSymbols } from 'pricer-types';
import { OrderBook, ExchangeError } from 'ccxt';

export class MainWorker extends Worker {
    public name: ProcessName = ProcessName.MAIN;

    private pricers: Map<DPHExchange, BasePricer> = new Map();

    // overwrite
    protected async start(): Promise<void> {
        const log: Logger = getLogger();
        log.info( `worker: [${ this.name }] got work single from master, start working ...` );
        await this.initPricer();
        await this.startTrade();
    }

    /**
     * init pricer
     */
    protected async initPricer(): Promise<void> {
        const log: Logger = getLogger();
        log.info( 'initing pricers ...' );
        const config: TDPHConfig = getConfig();
        const { supportedExchange } = config;

        for( let i = 0; i < supportedExchange.length; i ++ ) {
            const exchangeName: DPHExchange = supportedExchange[ i ];
            const pricer: CCXTPricer = new CCXTPricer();
            await pricer.init( exchangeName );
            this.pricers.set( exchangeName, pricer );
        }
        log.info( 'all pricers init done!' );
    }

    protected async startTrade(): Promise<void> {
        const log: Logger = getLogger();
        log.log( 'all init done! start trade ...' );
        const config: TDPHConfig = getConfig();

        const supportedStandard: Array<StandardCoin> = config.supportedStandard;
        const supportedCoin: Array<DPHCoin> = config.supportedCoin;

        for( let i = 0; i < supportedStandard.length; i ++ ) {
            const standardCoin: StandardCoin = supportedStandard[ i ];
            for( let j = 0; j < supportedCoin.length; j ++ ) {
                const coin: DPHCoin = supportedCoin[ j ];
                const orderBooks: Map<DPHExchange, OrderBook> = await this.fetchSupportedOrderBook( standardCoin, coin );
                console.log( orderBooks );
            }
        }

    }

    protected async fetchSupportedOrderBook( standardCoin: StandardCoin, coin: DPHCoin ): Promise<Map<DPHExchange, OrderBook>> {
        
        const config: TDPHConfig = getConfig();
        const { supportedExchange, exchanges } = config;

        const obLoaders: Array<Promise<OrderBook>> = [];

        for ( let i = 0; i < supportedExchange.length; i ++ ) {
            const exchangeName: DPHExchange = supportedExchange[ i ];
            if ( void( 0 ) == exchanges[ exchangeName ] ) {
                const error: Error = new Error( `trying to fetch order book with exchange: [${ exchangeName }], but not configured yet!` );
                throw error;
            }

            const pricer: BasePricer = this.getPricer( exchangeName );
            obLoaders.push( pricer.fetchOrderBook( standardCoin, coin ) );

        }

        const results: Array<OrderBook> = await Promise.all( obLoaders );
        const resOrderBooks: Map<DPHExchange, OrderBook> = new Map();

        for( let i = 0; i < supportedExchange.length; i ++ ) {
            const exchangeName: DPHExchange = supportedExchange[ i ];
            resOrderBooks.set( exchangeName, results[ i ] );
        }
        
        return resOrderBooks;

    }

    private getPricer( name: DPHExchange ): BasePricer {

        const pricer: BasePricer | undefined = this.pricers.get( name );
        if ( undefined === pricer ) {
            const error: Error = new Error( `trying to get exchange: [${ name }], but not inited yet!` );
            throw error;
        }

        return pricer;

    }

}

async function start(): Promise<void> {
    const main: MainWorker = new MainWorker();
    await main.init();
}

start();

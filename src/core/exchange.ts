/*
  exchange
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Wed Jun 20 2018 08:12:34 GMT+0800 (CST)
*/

import { Exchange, Market } from 'ccxt';
import { TExchanges, TExchange, TMarkets, TExchangeConfig } from 'exchange-types';
import { TDPHConfig } from 'main-types';

const allExchanges: TExchanges = new Map();

/**
 * init all exchanges
 * @param config 
 */
export async function initExchanges( config: TDPHConfig ): Promise<void> {
    const { exchanges } = config;
    for( let name in exchanges ) {
        const exchangeConfig: TExchangeConfig = exchanges[ name ];
        const exchange: TExchange = {
            fees: exchangeConfig.fees
        };
        allExchanges.set( name, exchange );
    }
}

/**
 * set up exchange
 * @param name 
 * @param markets 
 * @param ccxtExchange 
 */
export function setupExchange( name: string, markets: TMarkets, ccxtExchange: Exchange ): void {

    let exchange: TExchange|undefined = allExchanges.get( name );

    if ( undefined === exchange ) {
        const error: Error = new Error( `trying to set up exchange: [${ name }], but it not exsis!` );
        throw error;
    }

    exchange = <TExchange>exchange;
    exchange.exchange = ccxtExchange;
    exchange.markets = markets;
}

/**
 * get exchange by name
 * @param name 
 */
export function getExchange( name: string ): TExchange {
    const exchange: TExchange|undefined = allExchanges.get( name );
    if ( undefined === exchange ) {
        const error: Error = new Error( `trying to get exchange: [${ name }], but it not exists!` );
        throw error;
    }

    return <TExchange>exchange;
}

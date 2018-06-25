/*
  exchange
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Wed Jun 20 2018 08:12:34 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';

import { getLogger } from 'src/core/log';

import { Exchange, Market } from 'ccxt';
import { TExchanges, TExchange, TMarkets } from 'exchange-types';
import { TDPHConfig, TExchangeConfig } from 'main-types';
import { Logger } from 'log4js';
import { DPHExchange } from '../enums/main';

const allExchanges: TExchanges = new Map();

/**
 * init all exchanges
 * @param config 
 */
export async function initExchanges( config: TDPHConfig ): Promise<void> {
    const { exchanges, supportedExchange } = config;
    const log: Logger = getLogger();
    for( let i = 0; i < supportedExchange.length; i ++ ) {
        const name: DPHExchange = supportedExchange[ i ];
        if ( false === name in ccxt ) {
            const error: Error = new Error( `trying to init exchange: [${ name }], but can not found in ccxt!` );
            throw error;
        }

        log.info( `initing exchange: [${ name }] ...` );

        const exchangeConfig: TExchangeConfig = exchanges[ name ];
        const ccxtExchange: Exchange = new ( ccxt as any )[ name ]( {
            apiKey: exchangeConfig.apiKey,
            secret: exchangeConfig.apiSecret,
            timeout: 30 * 1000
        } );

        const markets: TMarkets = await ccxtExchange.loadMarkets();
        const exchange: TExchange = {
            fees: exchangeConfig.fees,
            exchange: ccxtExchange,
            markets: markets
        };
        log.info( `exchange: [${ name }] init done!` );
        allExchanges.set( <DPHExchange>name, exchange );
    }
}

/**
 * get exchange by name
 * @param name 
 */
export function getExchange( name: DPHExchange ): TExchange {
    const exchange: TExchange|undefined = allExchanges.get( name );
    if ( undefined === exchange ) {
        const error: Error = new Error( `trying to get exchange: [${ name }], but it not exists!` );
        throw error;
    }

    return exchange;
}

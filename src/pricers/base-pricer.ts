/*
* BasePricer
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Wed Jun 20 2018 07:55:14 GMT+0800 (CST)
*/

import { StandardCoin, DPHExchange, DPHCoin } from 'src/enums/main';
import { getConfig } from '../core/config';

import { OrderBook } from 'ccxt';
import { TPricerSymbols } from 'pricer-types';
import { TExchangeConfig, TDPHConfig } from 'main-types';

export abstract class BasePricer {

    public name: DPHExchange = DPHExchange.UNKNOW;

    protected exchangeConfig: TExchangeConfig = {} as TExchangeConfig; 

    private propertyCheck(): void {
        if ( DPHExchange.UNKNOW === this.name ) {
            const error: Error = new Error( `you must specify a name for pricer: [${ ( <any>this ).__proto__.constructor.name }] ` );
            throw error;
        }
    }

    public async init( priceName: DPHExchange ): Promise<void> {
        this.name = priceName;
        const config: TDPHConfig = getConfig();
        const { exchanges } = config;
        this.exchangeConfig = exchanges[ priceName ];

        process.nextTick( this.propertyCheck.bind( this ) );
    }

    public async fetchOrderBook( standardCoin: StandardCoin, coin: DPHCoin ): Promise<OrderBook|null> {
        throw new Error( `pricer: [${ this.name }] must implements method: fetchOrderBook` );
    }

}

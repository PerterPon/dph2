
/*
* th-strategy
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 25 2018 11:35:50 GMT+0800 (CST)
*/

import * as _ from 'lodash';
import chalk from 'chalk';

import { BaseStrategy } from './base-strategy';
import { getExchange } from 'src/core/exchange';
import { getLogger } from 'src/core/log';

import { TTradeActions } from 'trader-types';
import { StandardCoin, DPHCoin, DPHExchange, TradeType, StrategyType } from '../enums/main';
import { OrderBook } from 'ccxt';
import { TExchange, TFees } from 'exchange-types';
import { TTHConfig } from 'strategy-types';
import { Logger } from 'log4js';

type exchangeObMap = Map<DPHExchange, OrderBook>;

type BenefitResult = {
    benefit: number;
    buyPrice: number;
    buyAmount: number;
    buyExchange: DPHExchange;
    sellPrice: number;
    sellAmount: number;
    sellExchange: DPHExchange;
};

export class THStrategy extends BaseStrategy {

    private scidMap: Map<string, exchangeObMap> = new Map();
    protected strategyType: StrategyType = StrategyType.TH;

    public updateOrderBook( standardCoin: StandardCoin, coin: DPHCoin, exchangeName: DPHExchange, orderBook: OrderBook ): void {

        const scid: string = `${ standardCoin }_${ coin }`;
        const asks: Array<[ number, number ]> = orderBook.asks;
        const bids: Array<[ number, number ]> = orderBook.bids;

        let obOrderBook: exchangeObMap|undefined = this.scidMap.get( scid );
        if ( undefined === obOrderBook ) {
            obOrderBook = new Map();
            obOrderBook.set( exchangeName, orderBook );
            this.scidMap.set( scid, obOrderBook );
            // first time to this scid, no need calculate benefit.
            return;
        }

        let oldOrderBook: OrderBook|undefined = obOrderBook.get( exchangeName );

        if (
            undefined !== oldOrderBook &&
            ( true === _.isEqual( oldOrderBook.asks || [], asks ) && true === _.isEqual( oldOrderBook.bids || [], bids ) )
        ) {
            return;
        }

        obOrderBook.set( exchangeName, orderBook );
        const benefitResult: BenefitResult|null = this.calculateBenefit( scid );
        if ( null === benefitResult ) {
            return;
        }

        const { benefit, buyAmount, buyExchange, buyPrice, sellAmount, sellExchange, sellPrice } = benefitResult;
        if( 0 >= benefit ) {
            return;
        }

        const log: Logger = getLogger();
        log.info( chalk.green( `
            calculate new action, benefit: [${ benefit }]!
            buy price: [${ buyPrice }] amount: [${ buyAmount }] exchange: [${ buyExchange }]
            sell price: [${ sellPrice }] amout: [${ sellPrice }] exchange: [${ sellExchange }]` ) );

        const actions: TTradeActions = new Map();
        // set buy action
        actions.set( <DPHExchange>buyExchange, {
            tradeType: TradeType.BUY,
            price: buyPrice,
            amount: buyAmount,
            standardCoin,
            coin,
            strategyType: this.strategyType
        } );
        // set sell action
        actions.set( <DPHExchange>sellExchange, {
            tradeType: TradeType.SELL,
            price: sellPrice,
            amount: sellAmount,
            standardCoin,
            coin,
            strategyType: this.strategyType
        } );

        // dispatch actions
        if ( null !== this.delegate ) {
            this.delegate.newActions( actions );
        }

    }

    private calculateBenefit( scid: string ): BenefitResult|null {
        // won't be undefined
        const log: Logger = getLogger();
        const obMap: exchangeObMap = <exchangeObMap>this.scidMap.get( scid );
        const config: TTHConfig = <TTHConfig>this.strategyConfig;
        const { thBuffer } = config;

        let bestBid: number = Number.MIN_VALUE;
        let bestAsk: number = Number.MAX_VALUE;
        let bestAmount: number = Number.MAX_VALUE;
        let bestBuyFees: number = 0;
        let bestSellFees: number = 0;
        let buyExchange: DPHExchange = DPHExchange.UNKNOW;
        let sellExchange: DPHExchange = DPHExchange.UNKNOW;
        for( let [ exchangeName, orderBook ] of obMap ) {
            const exchangeConfig: TExchange = getExchange( exchangeName );
            const fees: TFees = exchangeConfig.fees;
            const buyFees: number = fees.buy;
            const sellFees: number = fees.sell;

            const { asks, bids } = orderBook;
            if ( true === _.isArray( asks ) && 0 < asks.length ) {
                const [ askPrice, askAmout ] = asks[ 0 ];
                if ( askPrice < bestAsk ) {
                    bestAsk = askPrice;
                    // task this min amount from all
                    if ( bestAmount > askAmout ) {
                        bestAmount = askAmout;
                    }
                    bestBuyFees = buyFees;
                    buyExchange = exchangeName;
                }
            }
            if ( true === _.isArray( bids ) && 0 < bids.length ) {
                const [ bidPrice, bidAmount ] = bids[ 0 ];
                if ( bidPrice > bestBid ) {
                    bestBid = bidPrice;
                    if ( bestAmount < bidAmount ) {
                        bestAmount = bidAmount;
                    }
                    bestSellFees = sellFees;
                    sellExchange = exchangeName;
                }
            }
        }

        // buy price higher than sell price, just return;
        if ( bestAsk > bestBid ) {
            return null;
        }

        const totalFees: number = bestBid * bestBuyFees + bestAsk * bestSellFees;
        const customDistance: number = bestBid - bestAsk;
        const benefit: number = customDistance - totalFees * ( 1 + thBuffer );
        if ( true ===  isNaN( benefit ) ) {
            return null
        }

        const result: BenefitResult = {
            benefit,
            buyAmount: bestAmount,
            buyPrice: bestAsk,
            buyExchange: buyExchange,
            sellAmount: bestAmount,
            sellPrice: bestBid,
            sellExchange: sellExchange
        };

        return result;
    }

}

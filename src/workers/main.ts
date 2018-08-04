/*
* Main
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/
import chalk from 'chalk';

import { Worker } from './worker';
import * as util from 'src/core/util';

import { getConfig } from 'src/core/config';
import { getLogger } from 'src/core/log';
import { getExchange } from 'src/core/exchange';

// pricers
import { BasePricer } from 'src/pricers/base-pricer';
import { CCXTPricer } from 'src/pricers/ccxt-pricer';

// strategys
import { BaseStrategy, DStrategy } from 'src/strategies/base-strategy';
import { THStrategy } from 'src/strategies/th-strategy';

// traders
import { BaseTrader } from 'src/traders/base-trader';
import { THTrader } from 'src/traders/th-trader';

import { ProcessName, StandardCoin, DPHExchange, StrategyType } from 'src/enums/main';
import { DPHCoin } from 'src/enums/main';

import { TDPHConfig, TStrategySeries } from 'main-types';
import { Logger } from 'log4js';
import { OrderBook, Market, exchanges } from 'ccxt';
import { TTradeActions, TTradeAction } from 'trader-types';
import { TExchange, TMarkets } from 'exchange-types';

export class MainWorker extends Worker implements DStrategy {
    public name: ProcessName = ProcessName.MAIN;

    private pricers: Map<DPHExchange, BasePricer> = new Map();
    private strategies: Map<StrategyType, TStrategySeries> = new Map();

    // ----------------- Delegate DSTrategy ------------------
    public newActions( actions: TTradeActions ): void {
        let strategyType: StrategyType = StrategyType.UNKNOW;
        for( let oneAction of actions ) {
            const action: TTradeAction = oneAction[ 1 ];
            strategyType = action.strategyType;
        }

        const strategySeries:TStrategySeries|undefined = this.strategies.get( strategyType );
        if ( undefined === strategySeries ) {
            const log: Logger = getLogger();
            log.warn( `tring to excute new action but can not found strategies: [${strategyType }]` );
            return;
        }
        strategySeries.trader.trade( actions );
    }

    // overwrite
    protected async start(): Promise<void> {
        const log: Logger = getLogger();
        log.info( `worker: [${ this.name }] got work single from master, start working ...` );
        await this.initPricer();
        await this.initStrategyAndTrader();
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

    protected async initStrategyAndTrader(): Promise<void> {
        const log: Logger = getLogger();
        log.info( 'initing strategys ...' );
        const config: TDPHConfig = getConfig();
        const { strategyConfig } = config;

        // TODO: support more strategy later
        const strategies: Array<StrategyType> = [ StrategyType.TH ];
        for( let i = 0; i < strategies.length; i ++ ) {
            const strategy: StrategyType = strategies[ i ];
            if ( strategy === StrategyType.TH ) {
                const thStrategy: BaseStrategy = new THStrategy( strategyConfig[ strategy ] );
                await thStrategy.init();
                const thTrader: BaseTrader = new THTrader();
                await thTrader.init();
                const strategySeries: TStrategySeries = {
                    strategy: thStrategy,
                    trader: thTrader
                };
                this.strategies.set( strategy, strategySeries );
            }
        }

        log.info( 'all strategy and traders init done!' );
    }

    /**
     * start trade
     */
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
                // 这里不用await监听，因为listen会进行while循环，否则会导致无法监听所有pricer
                this.listenPrice( standardCoin, coin );
            }
        }
    }

    /**
     * listen price
     * @param standardCoin 
     * @param coin 
     */
    protected async listenPrice( standardCoin: StandardCoin, coin: DPHCoin ): Promise<void> {
        const log: Logger = getLogger();

        log.info( `start listening price for coin: [${ chalk.yellow( coin ) }] ` );

        const config: TDPHConfig = getConfig();
        const { supportedExchange } = config;
        const { strategies } = this;

        while( true ) {
            await util.sleep( 1 * 1000 );
            for( let i = 0; i < supportedExchange.length; i ++ ) {
                const exchangeName: DPHExchange = supportedExchange[ i ];
                const pricer: BasePricer = this.getPricer( exchangeName );
                const orderBook: OrderBook|null = await pricer.fetchOrderBook( standardCoin, coin );
                if ( null === orderBook ) {
                    continue;
                }

                for ( let [ strategy, strategySeries ] of strategies ) {
                    const strategier: BaseStrategy = strategySeries.strategy;
                    // const trader: BaseTrader = strategySeries.trader;

                    strategier.updateOrderBook( standardCoin, coin, exchangeName, orderBook );
                    // if ( null === action ) {
                    //     continue;
                    // }

                    // await trader.trade( action );
                }
            }
        }

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

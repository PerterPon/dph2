
/*
* main
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Tue Jun 19 2018 07:04:19 GMT+0800 (CST)
*/

export enum ProcessName {
    UNKNOW = 'unknown',
    MASTER = 'master',
    MAIN = 'main',
    POLLING = 'polling'
}

export enum DPHExchange {
    UNKNOW = 'unknow',
    BITFINEX = 'bitfinex',
    BINANCE = 'binance'
}

export enum DPHCoin {
    BTC = "BTC",
    ETH = "ETH"
}

export enum StandardCoin {
    USD = 'USD',
    BTC = 'BTC'
}

export enum TradeType {
    SELL,
    BUY
}

export enum StrategyType {
    TH = 'TH'
}

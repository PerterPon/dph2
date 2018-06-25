
declare module 'exchange-types' {

    import { DPHExchange } from 'src/enums/main';
    import { Market, Exchange } from 'ccxt';

    export type TExchange = {
        markets : TMarkets;
        fees: TFees;
        exchange: Exchange;
    };

    export type TMarkets = {
        [symbol: string]: Market;
    };

    export type TFees = {
        taker: number;
        maker: number;
    };

    export type TExchanges = Map<DPHExchange, TExchange>;

}

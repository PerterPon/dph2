
declare module 'trader-types' {

    import { TradeType, DPHExchange, StandardCoin, DPHCoin } from 'src/enums/main';

    export type TTradeActions = Map<DPHExchange, TTradeAction>;

    export type TTradeAction = {
        tradeType: TradeType;
        amount: number;
        standardCoin: StandardCoin;
        coin: DPHCoin;
    }

}

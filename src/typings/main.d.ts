
/*
  main.d.ts
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sun Jun 17 2018 16:42:59 GMT+0800 (CST)
*/

declare module 'main-types' {  

  import { BaseStrategy } from 'src/strategies/base-strategy';
  import { BaseTrader } from 'src/traders/base-trader';

  import { ProcessName, DPHCoin, StandardCoin, DPHExchange, StrategyType } from 'src/enums/main';
  import { Configuration as TLogConfiguration } from 'log4js';
  import { TFees } from 'exchange-types';
  import { TPricerSymbols } from 'pricer-types';

  export type TDPHConfig = {
    log: TLogConfiguration,
    ipc: {
      [name: string]: TProcessConfig;
    },
    exchanges: {
      [name: string]: TExchangeConfig;
    },
    supportedCoin: Array<DPHCoin>;
    supportedStandard: Array<StandardCoin>;
    supportedExchange: Array<DPHExchange>;
    database: TDataBaseConfig;
  };

  export type TProcessConfig = {
    file: string;
    sock?: string;
  };

  export type TExchangeConfig = {
    fees: TFees;
    apiKey: string;
    apiSecret: string;
    USDSymbols: TPricerSymbols;
    BTCSymbols: TPricerSymbols;
  };

  export type TDataBaseConfig = {
    host: string;
    user: string;
    password: string;
    database?: string;
    port?: number;
    showLog: boolean;
  };

  export type TProcessRegister = {
    name: ProcessName;
  };

  export type TStrategySeries = {
    strategy: BaseStrategy;
    trader: BaseTrader;
  };

}

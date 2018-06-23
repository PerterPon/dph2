
/*
  main.d.ts
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sun Jun 17 2018 16:42:59 GMT+0800 (CST)
*/

declare module 'main-types' {  
  import { ProcessName } from 'src/enums/main';
  import { Configuration as TLogConfiguration } from 'log4js';
  import { TExchangeConfig } from 'exchange-types';

  export type TProcessConfig = {
    file: string;
    sock?: string;
  };

  export type TDPHConfig = {
    log: TLogConfiguration,
    ipc: {
      [name: string]: TProcessConfig;
    },
    exchanges: {
      [name: string]: TExchangeConfig;
    },
    database: TDataBaseConfig;
  };

  export type TProcessRegister = {
    name: ProcessName;
  };

  export type TDataBaseConfig = {
    host: string;
    user: string;
    password: string;
    database?: string;
    port?: number;
    showLog: boolean;
  };

}

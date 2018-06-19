
/*
  main.d.ts
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sun Jun 17 2018 16:42:59 GMT+0800 (CST)
*/

declare module 'main-types' {  
  import { ProcessName } from 'src/enums/main';
  import { Configuration } from 'log4js';

  export type TProcessConfig = {
    file: string;
    sock?: string;
  };

  export type TDPHConfig = {
    log: Configuration,
    ipc: {
      [name: string]: TProcessConfig;
    }
  };

  export type TProcessRegister = {
    name: ProcessName;
  };

}

/*
* log
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Tue Jun 19 2018 06:57:55 GMT+0800 (CST)
*/

import * as log4js from 'log4js';

import { ProcessName } from 'src/enums/main';

import { TDPHConfig } from 'main-types';

/**
 * 每个进程一个logger
 */
let logger: log4js.Logger = {} as log4js.Logger;

export function initLogger( config: TDPHConfig, loggerName?: ProcessName ): log4js.Logger {
    log4js.configure( config.log );
    logger = log4js.getLogger( loggerName );
    return logger
}

export function getLogger(): log4js.Logger {
    return logger;
}


/*
* db
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Sat Jun 23 2018 10:01:15 GMT+0800 (CST)
*/

import * as _ from 'lodash';
import * as util from 'util';

import { getLogger } from 'src/core/log';

import FreshMysql from 'fresh-mysql';
import { TDataBaseConfig } from 'main-types';
import { Logger } from 'log4js';

let db: FreshMysql = new FreshMysql();
let promisifyQuery: <T>( sql: string, where?: Array<any> ) => Promise<T> = ():any => {};
let promisifyTransQuery: <T>( sqlList: Array<{ sql: string, where?: Array<any>, cb?: () => {} }> ) => Promise<T> = (): any => {};

export function initDb( config: TDataBaseConfig ): void {
    const log: Logger = getLogger();
    const defaultConfig: TDataBaseConfig = <TDataBaseConfig>{
        port: 3306,
        showLog: false
    };
    
    const dbConfig: TDataBaseConfig = _.merge( {}, defaultConfig, config );
    db.init( dbConfig, log );
    promisifyQuery = util.promisify<string, Array<any>|undefined, any>( db.query );
    promisifyTransQuery = util.promisify<Array<{ sql: string, where?: Array<any>, cb?: () => {} }>, any>( db.transactionQuery );
}

export async function query<T>( sql: string, where?: Array<string> ): Promise<T> {
    return await promisifyQuery<T>( sql, where );
}

export async function transactionQuery<T>( sqlList: Array<{ sql: string, where?: Array<any>, cb?: () => {} }> ): Promise<T> {
    return await promisifyTransQuery<T>( sqlList );
}

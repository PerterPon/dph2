
/*
* Config
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 18 2018 13:40:06 GMT+0800 (CST)
*/

import * as _ from 'lodash';

import * as Util from 'src/core/util';

import { TDPHConfig } from 'main-types';

let config: TDPHConfig = {} as TDPHConfig;

export async function fetchConfig( env?: string ): Promise<TDPHConfig> {
    config = await Util.parseDPHConfig( env );

    return config;
}

export async function fetchCurrentConfig(): Promise<TDPHConfig> {

    if ( true === _.isEmpty( config ) ) {
        const error: Error = new Error( 'config is null!' );
        throw error;
    }

    return config;

}

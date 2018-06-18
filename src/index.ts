/*
  mock
  Author: PerterPon<PerterPon@gmail.com>
  Create: Sun Jun 17 2018 14:58:36 GMT+0800 (CST)
*/

import * as Util from 'src/core/util';
import * as commander from 'commander';

commander
    .option( '-v, --env', 'running env' )
    .parse( process.argv );

async function start() {

    const dphConfig: { [ name: string ]: any } = await Util.parseDPHConfig( commander.env );
    console.log( dphConfig );

}

start();

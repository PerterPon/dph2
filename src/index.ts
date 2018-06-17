/*
  mock
  Author: PerterPon<PerterPon@gmail.com>
  Create: Sun Jun 17 2018 14:58:36 GMT+0800 (CST)
*/

import * as pm2 from 'pm2';
import * as log4js from 'log4js';
import * as Util from 'src/core/util';

async function start() {

    const dphConfig: { [ name: string ]: any } = await Util.parseDPHConfig();

}

function configLog(): void {

}

function startPm2(): void {

}

start();

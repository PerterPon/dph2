

import * as ccxt from 'ccxt';
import { SSL_OP_COOKIE_EXCHANGE } from 'constants';


const exchange: ccxt.Exchange = new ccxt.huobipro();

exchange.loadMarkets().then( ( markets ) => {
    console.log( exchange.markets );
} );


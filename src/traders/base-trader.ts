
/*
* base-trader
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Mon Jun 25 2018 12:22:52 GMT+0800 (CST)
*/

import { TTradeActions } from 'trader-types';

export abstract class BaseTrader {
    
    public async init(): Promise<void> {
        
    }

    public async trade( actions: TTradeActions ): Promise<void> {

    }

}

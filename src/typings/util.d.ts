/*
* util.d
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Tue Jun 19 2018 06:51:11 GMT+0800 (CST)
*/

declare module 'util-types' {

    import { IPCErrorCode, IPCEvent } from 'src/enums/util';

    export type IPCStruct<T> = {
        event: IPCEvent;
        success: boolean;
        data: T;
        errorMessage?: string;
        errorCode?: IPCErrorCode;
    };

}

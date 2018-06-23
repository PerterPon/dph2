/*
* IPCHandler
* Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
* Create: Tue Jun 19 2018 07:21:32 GMT+0800 (CST)
*/

import { getLogger } from 'src/core/log';

import { IPCErrorCode, IPCEvent } from 'src/enums/util';

import { IPCStruct } from 'util-types';
import { Logger } from 'log4js';

const logger: Logger = getLogger();

export function IPCBufferHandler<T>( bufferData: Buffer ): T {
    const dataString: string = bufferData.toString();
    const data: IPCStruct<T> = JSON.parse( dataString );
    return IPCHandler<T>( data );
}

export function IPCBufferWrapper<T>( data: T, event: IPCEvent, success: boolean = true, errorCode: IPCErrorCode = IPCErrorCode.NONE, errorMessage: string = '' ): Buffer {
    const IPCMessage: IPCStruct<T> = IPCWrapper( data, event, success, errorCode, errorMessage );

    const message: string = JSON.stringify( IPCMessage );
    const messageBuffer: Buffer = new Buffer( message );
    return messageBuffer;
}

export function IPCHandler<T>( IPCMessage: IPCStruct<T> ): T {
    const errorCode: IPCErrorCode = IPCMessage.errorCode as IPCErrorCode;
    const data: T = IPCMessage.data;
    const errorMessage: string = IPCMessage.errorMessage as string;
    const success: boolean = IPCMessage.success;
    if ( false === success ) {
        const message: string = `[IPC ERROR] error code: [${ errorCode }], message: [${ errorMessage }]`;
        const error: Error = new Error( message );
        logger.error( message );
        throw error;
    }

    return data;
}

export function IPCWrapper<T>( data: T, event: IPCEvent, success: boolean = true, errorCode: IPCErrorCode = IPCErrorCode.NONE, errorMessage: string = '' ): IPCStruct<T> {
    const IPCMessage: IPCStruct<T> = {
        event,
        data,
        success,
        errorCode,
        errorMessage
    };

    return IPCMessage;
}

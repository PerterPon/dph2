/*
  Util
  Author: PerterPon<PerterPon@gmail.com>
  Create: Sun Jun 17 2018 16:00:34 GMT+0800 (CST)
*/

import * as fs from 'fs-extra';
import * as path from 'path';
import { DocumentLoadResult, safeLoad } from 'js-yaml';
import * as _ from 'lodash';

import { TDPHConfig } from 'main-types';
import { TExchanges, TExchangeConfig } from 'exchange-types';

export type AsyncReadFileResult = ( path: string, encodeing: string ) => Promise<string>;

/**
 * sleep
 * @param time 
 */
export function sleep( time: number ): Promise<void> {

    return new Promise<void>( ( resolve, reject ) => {

        setTimeout( resolve, time);

    } );

}

/**
 * 
 * @param envFile 
 */
export async function parseDPHConfig( env?: string ): Promise<TDPHConfig> {
    const etcPath: string = getEtcFolderPath();
    const defaultFilePath: string = path.join( etcPath, '/default.yaml' );
    const defaultFileContent: string = await fs.readFile( defaultFilePath, 'utf-8' );
    const defaultConfig: DocumentLoadResult = safeLoad( defaultFileContent );

    let dphConfig: DocumentLoadResult = {};
    if ( true === _.isString( env ) ) {
        const envFilePath: string = path.join( etcPath, `/${ env }.yaml` );
        const envFileContent: string = await fs.readFile( envFilePath, 'utf-8' );
        const envConfig: DocumentLoadResult = safeLoad( envFileContent );
        dphConfig = _.merge( defaultConfig, envConfig );
    } else {
        dphConfig = defaultConfig;
    }

    return <TDPHConfig>dphConfig;
}

/**
 * mkdirp
 * @param folderPath 
 */
export async function mkdirp( folderPath: fs.PathLike ): Promise<void> {
    await fs.mkdirp( <string>folderPath );
}

export function getEtcFolderPath(): string {
    const etcPath: string = path.join( __dirname, '../../etc' );
    return etcPath;
}

export function getOutFolderPath(): string {
    const outPath: string = path.join( __dirname, '../../out' );
    return outPath;
}

export function getWorkersFolderPath(): string {
    const workersPath: string = path.join( __dirname, '../workers' );
    return workersPath;
}

export function getMasterSockPath( file: string ): string {
    const outPath: string = getOutFolderPath();
    const sockPath: string = path.join( outPath, file );
    return sockPath;
}

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
export async function parseDPHConfig( envFile?: string ): Promise<TDPHConfig> {
    const defaultFilePath: string = path.join( __dirname, '../../etc/default.yaml' );
    const defaultFileContent: string = await fs.readFile( defaultFilePath, 'utf-8' );
    const defaultConfig: DocumentLoadResult = safeLoad( defaultFileContent );

    let dphConfig: DocumentLoadResult = {};
    if ( true === _.isString( envFile ) ) {
        const envFileContent: string = await fs.readFile( envFile as string, 'utf-8' );
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

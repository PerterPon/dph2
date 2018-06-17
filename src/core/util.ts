/*
  Util
  Author: PerterPon<PerterPon@gmail.com>
  Create: Sun Jun 17 2018 16:00:34 GMT+0800 (CST)
*/

import * as fs from 'fs';
import * as path from 'path';
import { DocumentLoadResult, safeLoad } from 'js-yaml';
import * as Util from 'util';
import * as _ from 'lodash';

export type AsyncReadFileResult = ( path: fs.PathLike, encodeing: string ) => Promise<string>;

export async function asyncReadFile( path: fs.PathLike, encodeing: string ): Promise<string> {
    const promisifyReadFile: AsyncReadFileResult = Util.promisify<fs.PathLike, string, string>( fs.readFile );
    const fileContent: string = await promisifyReadFile( path, encodeing );
    return fileContent
}

export function sleep( time: number ): Promise<void> {

    return new Promise<void>( ( resolve, reject ) => {

        setTimeout( resolve, time);

    } );

}

export async function parseDPHConfig( envFile?: string ): Promise<Object> {
    const defaultFilePath: string = path.join( __dirname, '../../etc/defailt.yaml' );
    const defaultFileContent: string = await asyncReadFile( defaultFilePath, 'utf-8' );
    const defaultConfig: DocumentLoadResult = safeLoad( defaultFileContent );

    let dphConfig: DocumentLoadResult = {};
    if ( true === _.isString( envFile ) ) {
        const envFileContent: string = await asyncReadFile( envFile as string, 'utf-8' );
        const envConfig: DocumentLoadResult = safeLoad( envFileContent );
        dphConfig = _.merge( defaultConfig, envConfig );
    } else {
        dphConfig = defaultConfig;
    }

    return <Object>dphConfig;
}

/// <reference types="node" />
import { WriteFileOptions } from 'fs';
/**
 * 转换异常，返回null
 * @param namePath
 */
export declare function convertNamePath(namePath: string): (string | number)[];
export declare function isImage(str: string | number): boolean;
export declare function tryToSaveFileSync(filePath: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void;
export declare function globFilesPath(globPath: string): Promise<string[]>;
export declare function getExistFileListByFileListPath(fileListPath: string[]): string[];
export declare function globFilesPathSync(globPath: string): string[];
export declare function globFilesContentSync(globPath: string): {
    [filePath: string]: string;
};
export declare function normalizeProcessArg(strArg: string): string;

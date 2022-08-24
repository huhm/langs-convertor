import { IConvertedLangItem } from './convert-utils';
import { ILangObj } from './interface';
export interface ILangExcelOption {
    /**
     * 生成的文件地址
     * 默认cwd+'./lang.xlsx'
     */
    output?: string;
    /**
     * sheet名称，默认'Default'
     */
    sheetName?: string;
    customHeaders?: string[][];
    langNameListToTranslate?: string[];
}
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export declare function convertLangItemsToExcel(list: IConvertedLangItem[], options?: ILangExcelOption): void;
export declare type IMultiLangExcelOption = Omit<ILangExcelOption, 'langNameListToTranslate' | 'customHeaders'>;
declare type ISheetData = {
    name: string;
    data: string[][];
};
export declare function createSheetDataByMultiLangMap(langMap: {
    [langName: string]: IConvertedLangItem[];
}, options?: Pick<IMultiLangExcelOption, 'sheetName'>): ISheetData;
export declare function buildExcel(sheetList: ISheetData[], output?: string): void;
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export declare function convertMultiLangsLangItemsMapToExcel(langMap: {
    [langName: string]: IConvertedLangItem[];
}, options?: IMultiLangExcelOption): void;
export declare function convertToExcel(langObj: ILangObj, options?: ILangExcelOption): IConvertedLangItem[];
/**
 * 多语言列表生成excel
 * @param langMap
 * @param options
 */
export declare function convertMultiLangsToExcel(langMap: {
    [langName: string]: ILangObj;
}, options?: IMultiLangExcelOption): {
    [langName: string]: IConvertedLangItem[];
};
/**
 * 生成多语言模块对象
 * @param fileGlobPath e.g:"./local\/**\/*.json"
 * @param convertToLangJson (strContent)=>JSON.parse(strContent)
 * @param basePath 模块开始路径，basePath之后的路径将转化为模块名 "./local"
 * {[langName]:{path1:{path2:json}}}
 */
export declare function createLangModuleMapByFileGlob(fileGlobPath: string, options: {
    convertToLangJson: (fileContent: string) => ILangObj;
    basePath: string | ((filePath: string) => {
        modulePathList: string[];
        langName: string;
    });
}): {
    [langName: string]: ILangObj;
};
/**
 * 从多语言列表中生成语言缺失部分的excel
 * 每个语言包一个文件
 * @param langMap
 * @param options
 */
export declare function convertSubstractLangsToExcels(langMap: {
    [langName: string]: ILangObj;
}, fromLangName: string, options?: {
    /**
     * 生成的文件路径（文件名为{langName}.xlsx）
     * 默认值为process.cwd()
     */
    output?: string;
    /**
     * sheet名称，默认'Default'
     */
    sheetName?: string;
    /**
     * 空数据占位符前缀，以placeholderPrefix开头的数据视为空数据
     */
    placeholderPrefix?: string;
}): void;
export {};

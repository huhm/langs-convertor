import { ILangObj } from './interface';
import { ConvertedLangItem } from './convert-utils';
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
    /**
     * 待翻译的语言列表(仅用来生成标题行)
     * en,zh,ar...
     */
    langNameListToTranslate?: string[];
    /**
     * 待翻译的语言列表名称(仅用来生成标题行)
     */
    langTitleListToTranslate?: string[];
}
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export declare function convertLangItemsToExcel(list: ConvertedLangItem[], options?: ILangExcelOption): void;
export declare type IMultiLangExcelOption = Omit<ILangExcelOption, 'langNameListToTranslate' | 'langTitleListToTranslate'>;
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export declare function convertMultiLangsLangItemsMapToExcel(langMap: {
    [langName: string]: ConvertedLangItem[];
}, options?: IMultiLangExcelOption): void;
export declare function convertToExcel(langObj: ILangObj, options?: ILangExcelOption): ConvertedLangItem[];
/**
 * 多语言列表生成excel
 * @param langMap
 * @param options
 */
export declare function convertMultiLangsToExcel(langMap: {
    [langName: string]: ILangObj;
}, options?: IMultiLangExcelOption): {
    [langName: string]: ConvertedLangItem[];
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
    [langName: string]: ILangObj | {
        [moduleName: string]: ILangObj | any;
    };
};

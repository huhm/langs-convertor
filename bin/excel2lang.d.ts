import LangsInfoModel from './LangsInfoModel';
export declare function readSheetDataFromExcel(filePath: string, sheetIdx: number): [][];
export interface IConvertLangOption {
    /**
     * 定位ID列和语言行的位置
     * 默认0
     */
    anchorCellPos?: [number, number];
}
/**
 *  excel文件--> 多语言kv
 * 支持一行有多个key
 * @param sheetData
 * @param sheetResult
 * @param options
 */
export declare function updateLangsInfoModelFromSheetData(sheetData: string[][], sheetResult?: LangsInfoModel, options?: IConvertLangOption): LangsInfoModel;
export interface IConvertFileOption {
    /**
     * 默认当前目录的dist-lang
     */
    output?: string;
    /**
     * 生成前时候清除目录
     */
    clear?: boolean;
    /**
     * 返回为空时，表示忽略该语言包
     */
    getFileName?: (info: {
        langName: string;
        destDirPath: string;
        moduleName?: string;
    }) => string | null;
    /**
     * 字段缺失策略
     * none:不设置 (默认)
     * placeholder: 使用missingValue占位符值
     */
    missingMode?: 'none' | 'placeholder';
    missingValue?: string;
}
export declare function convertSheetToJsonFiles(langsInfoModel: LangsInfoModel, options?: IConvertFileOption): void;
export declare function convertSheetToJsonModuleFiles(langsInfoModel: LangsInfoModel, options?: IConvertFileOption): void;
export declare function convertSheetToTsFiles(langsInfoModel: LangsInfoModel, options?: IConvertFileOption): void;
export declare function convertExcelToFile(filePathList: string[], options?: {
    /**
     * 表格位置，默认第0个
     */
    sheetIdx?: number;
    /**
     * json： 每个语言一个文件
     * xml: 已有模板 ，每个语言一个文件
     * json-module:已有模板，每个语言每个模块一个文件
     * ts: 已有模板 ，每个语言每个模块一个文件
     * custom: 自定义有模板，每个语言一个文件
     * custom-module: 自定义模板，每个语言一个文件
     */
    fileType: 'json' | 'xml' | 'ts' | 'json-module' | 'custom' | 'custom-module';
    /**
     * fileType为custom时有效
     * 自定义的模板路径，生成的文件ext为模板的后缀
     * it对象:{
     *  langName:'语言简称',
     *  moduleName:'模块名称',
     *  moduleJsonString:'多语言模块对象JSON字符串',
     *  moduleObj:'多语言模块对象JSON对象'
     * }
     */
    customTemplatePath?: string;
    /**
     * 模板字段（只有模板字段中的字段才会被翻译）
     */
    template?: string;
} & IConvertLangOption & IConvertFileOption): void;

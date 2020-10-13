export declare type LangSummaryInfo = {
    /**
     * 语言简称
     */
    name: string;
    /**
     * 所在列idx
     */
    col: number;
};
/**
 * 多语言数据对象
 */
export interface LangsInfo {
    [langName: string]: ILangObj;
}
export interface IPlainLangInfo {
    [fieldPathName: string]: ILangObjValueTypeBase;
}
export interface IPlainLangsInfo {
    [langName: string]: IPlainLangInfo;
}
/**
 * 单个语言的对象
 */
export interface ILangObj {
    [key: string]: ILangObjValueType;
}
export declare type ILangObjValueTypeBase = string;
export declare type ILangObjValueType = ILangObjValueTypeBase | ILangObjValueTypeBase[] | ILangObj[] | ILangObj;
export interface ILangConvertErrorInfo {
    namePath: string;
    /**
     * NoData
     * ExtraData
     * InvalidNamePath
     */
    reason: string;
    langName: string;
    row: number;
    col: number;
}

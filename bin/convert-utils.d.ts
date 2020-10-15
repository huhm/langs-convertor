import { ILangObj, ILangObjValueTypeBase, IPlainLangInfo } from './interface';
export declare const DEFAULT_ID_TAG = "[[ID]]";
export interface IConvertedLangItem {
    name: string;
    value: ILangObjValueTypeBase;
}
/**
 *
 * @param langObj 待翻译的语言文件对象
 * @returns {key:string,value:string}[]
 */
export declare function convertLangInfoToList(langObj: ILangObj): IConvertedLangItem[];
export declare function convertPlainLangInfoToLangInfo(plainLangInfoMap: IPlainLangInfo, _langResult?: ILangObj): ILangObj;

export type LangSummaryInfo = {
  /**
   * 语言简称
   */
  name: string
  /**
   * 所在列idx
   */
  col: number
}
/**
 * 多语言数据对象
 */
export interface LangsInfo {
  [langName: string]: ILangObj
}

export interface IPlainLangInfo{
  [fieldPathName: string]: ILangObjValueTypeBase 
}
export interface IPlainLangsInfo{
  [langName: string]: IPlainLangInfo 
}
/**
 * 单个语言的对象
 */
export interface ILangObj {
  [key: string]: ILangObjValueType
}
export type ILangObjValueTypeBase=  string
export type ILangObjValueType = ILangObjValueTypeBase | ILangObjValueTypeBase[] | ILangObj[] | ILangObj


export interface ILangConvertErrorInfo{
    namePath:string;
    /**
     * NoData
     * ExtraData
     * InvalidNamePath
     */
    reason:string;

    //#region 由遍历器自动加的自动

    langName:string;
    row:number;
    col:number
    //#endregion
}
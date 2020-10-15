import { ILangObj, ILangObjValueTypeBase, LangsInfo } from './interface';
import LangInfoModel, { LangInfoItemModel } from './LangInfoModel';
export default class LangsInfoModel {
    private _map;
    constructor();
    private _getOrCreateLangInfoModel;
    getLangInfoModel(langName: string): LangInfoModel;
    /**
     * 设置语言字段
     * @param langName
     * @param fieldNamePath
     * @param fieldValue
     */
    setLangField(langName: string, fieldNamePath: string, fieldValue: ILangObjValueTypeBase): LangInfoItemModel;
    /**
     * 删除语言字段
     * @param langName
     * @param fieldNamePath
     */
    deleteLangField(langName: string, fieldNamePath: string): void;
    /**
     * 批量设置字段
     * @param langName
     * @param langInfo
     */
    setLangFields(langName: string, langInfo: ILangObj): void;
    toLangsInfoObj(): LangsInfo;
    forEachLang(func: (langVal: LangInfoModel, langName: string) => void): void;
    /**
     * 遍历字段
     * @param func
     */
    forEachField(func: (fieldItem: LangInfoItemModel, langName: string) => void): void;
    /**
     * 遍历第一层module(fieldNamePath的第一节，如果只有一节，放到root中)
     * @param func
     */
    forEachModule(func: (data: {
        moduleObj: ILangObj;
        moduleName?: string;
        langName: string;
        langModel: LangInfoModel;
    }) => void): void;
    normalizeByTemplate(templateFieldsSet: Set<string>, options: {
        /**
         * 字段缺失策略
         * none:不设置
         * placeholder: 使用missingValue占位符值
         */
        missingMode?: 'none' | 'placeholder';
        missingValue?: string;
    }): void;
    /**
     * 计算两个语言包的差集 fromLangName-langName
     * @param fromLangName
     * @param langName
     * @param options
     */
    substractLangSet(fromLangName: string, langName: string, options?: {
        /**
         * 空数据占位符前缀，以placeholderPrefix开头的数据视为空数据
         */
        placeholderPrefix?: string;
    }): LangInfoItemModel[];
}

import { ILangObj, ILangObjValueTypeBase, LangsInfo } from './interface';
import LangInfoModel, { LangInfoItemModel } from './LangInfoModel';
export default class LangsInfoModel {
    private _map;
    constructor();
    private _getOrCreateLangInfoModel;
    setLangField(langName: string, fieldNamePath: string, fieldValue: ILangObjValueTypeBase): LangInfoItemModel;
    deleteLangField(langName: string, fieldNamePath: string): void;
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
}

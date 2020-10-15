import { IConvertedLangItem } from './convert-utils';
import { ILangObj, ILangObjValueTypeBase } from './interface';
export declare class LangInfoItemModel implements IConvertedLangItem {
    private _fieldName;
    get fieldName(): string;
    private _fieldValue;
    constructor(fieldName: string, fieldValue: ILangObjValueTypeBase);
    /**
     * 是否是无效字段占位符
     */
    isPlaceHolder: boolean;
    setValue(v: ILangObjValueTypeBase): void;
    getValue(): string;
    getNamePathList(): (string | number)[];
    get name(): string;
    get value(): string;
}
/**
 * 语言信息实体
 */
export default class LangInfoModel {
    private _langName;
    private _plainMap;
    private _fieldsList;
    get fieldsList(): LangInfoItemModel[];
    constructor(langName: string);
    private findLangItemInList;
    private indexOfLangItem;
    setFields(langInfo: ILangObj): void;
    setField(fieldNamePath: string, fieldValue: ILangObjValueTypeBase): LangInfoItemModel;
    getFieldValue(fieldNamePath: string): string;
    isExist(fieldNamePath: string): boolean;
    deleteField(fieldNamePath: string): void;
    toLangObj(): ILangObj;
}

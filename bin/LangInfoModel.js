"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangInfoItemModel = void 0;
const convert_utils_1 = require("./convert-utils");
const utils_1 = require("./utils");
class LangInfoItemModel {
    constructor(fieldName, fieldValue) {
        /**
         * 是否是无效字段占位符
         */
        this.isPlaceHolder = false;
        this._fieldName = fieldName;
        this._fieldValue = fieldValue;
    }
    get fieldName() {
        return this._fieldName;
    }
    setValue(v) {
        this._fieldValue = v;
    }
    getValue() {
        return this._fieldValue;
    }
    getNamePathList() {
        return utils_1.convertNamePath(this._fieldName);
    }
    //#region IConvertedLangItem
    get name() {
        return this._fieldName;
    }
    get value() {
        return this._fieldValue;
    }
}
exports.LangInfoItemModel = LangInfoItemModel;
/**
 * 语言信息实体
 */
class LangInfoModel {
    constructor(langName) {
        this._langName = langName;
        this._plainMap = {};
        this._fieldsList = [];
    }
    get fieldsList() {
        return this._fieldsList;
    }
    findLangItemInList(fieldNamePath) {
        let idx = this.indexOfLangItem(fieldNamePath);
        if (idx != null) {
            return this._fieldsList[idx];
        }
    }
    indexOfLangItem(fieldNamePath) {
        for (let i = 0; i < this._fieldsList.length; i++) {
            const item = this._fieldsList[i];
            if (item.fieldName === fieldNamePath) {
                return i;
            }
        }
    }
    setFields(langInfo) {
        const list = convert_utils_1.convertLangInfoToList(langInfo);
        list.forEach(item => {
            this.setField(item.name, item.value);
        });
    }
    setField(fieldNamePath, fieldValue) {
        const oldVal = this._plainMap[fieldNamePath];
        let fieldItem;
        const newVal = fieldValue || oldVal;
        if (this._plainMap[fieldNamePath] === undefined) {
            fieldItem = new LangInfoItemModel(fieldNamePath, fieldValue);
            this._fieldsList.push(fieldItem);
        }
        else {
            fieldItem = this.findLangItemInList(fieldNamePath);
            fieldItem.setValue(newVal);
        }
        this._plainMap[fieldNamePath] = newVal;
        return fieldItem;
    }
    getFieldValue(fieldNamePath) {
        return this._plainMap[fieldNamePath];
    }
    isExist(fieldNamePath) {
        return !!this._plainMap[fieldNamePath];
    }
    deleteField(fieldNamePath) {
        let idx = this.indexOfLangItem(fieldNamePath);
        if (idx != null) {
            this._fieldsList.splice(idx, 1);
        }
        delete this._plainMap[fieldNamePath];
    }
    toLangObj() {
        return convert_utils_1.convertPlainLangInfoToLangInfo(this._plainMap);
    }
}
exports.default = LangInfoModel;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LangInfoModel_1 = __importDefault(require("./LangInfoModel"));
class LangsInfoModel {
    constructor() {
        this._map = {};
    }
    _getOrCreateLangInfoModel(langName) {
        let v = this._map[langName];
        if (!v) {
            v = new LangInfoModel_1.default(langName);
            this._map[langName] = v;
        }
        return v;
    }
    setLangField(langName, fieldNamePath, fieldValue) {
        const m = this._getOrCreateLangInfoModel(langName);
        return m.setField(fieldNamePath, fieldValue);
    }
    deleteLangField(langName, fieldNamePath) {
        const m = this._getOrCreateLangInfoModel(langName);
        return m.deleteField(fieldNamePath);
    }
    toLangsInfoObj() {
        let result = {};
        for (let langName in this._map) {
            result[langName] = this._map[langName].toLangObj();
        }
        return result;
    }
    //#region 遍历
    forEachLang(func) {
        for (let langName in this._map) {
            func(this._map[langName], langName);
        }
    }
    /**
     * 遍历字段
     * @param func
     */
    forEachField(func) {
        this.forEachLang((langVal, langName) => {
            ;
            [...langVal.fieldsList].forEach((item) => {
                func(item, langName);
            });
        });
    }
    /**
     * 遍历第一层module(fieldNamePath的第一节，如果只有一节，放到root中)
     * @param func
     */
    forEachModule(func) {
        this.forEachLang((langVal, langName) => {
            const rootData = {};
            const langObj = langVal.toLangObj();
            for (let moduleName in langObj) {
                let moduleV = langObj[moduleName];
                if (moduleV &&
                    typeof moduleV === 'object' &&
                    !(moduleV instanceof Array)) {
                    // 非基础对象
                    func({
                        moduleObj: moduleV,
                        moduleName,
                        langName,
                        // fieldsList:langVal.fieldsList,
                        langModel: langVal
                    });
                }
                else {
                    // 根上的数据
                    rootData[moduleName] = moduleV;
                }
            }
            if (Object.keys(rootData).length > 0) {
                // TODO 不支持
                func({
                    moduleObj: rootData,
                    //   moduleName: null,
                    langName,
                    langModel: langVal
                });
            }
        });
    }
    //#endregion
    //#region normalizeByTemplate
    normalizeByTemplate(templateFieldsSet, options) {
        // 1. delete the extra fields
        this.forEachField((fieldItem, langName) => {
            if (!templateFieldsSet.has(fieldItem.fieldName)) {
                this.deleteLangField(langName, fieldItem.fieldName);
            }
        });
        // 2. add the exist fields?
        const { missingMode, missingValue } = options;
        if (missingMode && missingMode !== 'none') {
            templateFieldsSet.forEach(fieldName => {
                this.forEachLang((langModel) => {
                    if (!langModel.isExist(fieldName)) {
                        langModel.setField(fieldName, missingValue).isPlaceHolder = true;
                    }
                });
            });
        }
    }
}
exports.default = LangsInfoModel;

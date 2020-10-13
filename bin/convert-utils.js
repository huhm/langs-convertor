"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPlainLangInfoToLangInfo = exports.convertLangInfoToList = void 0;
const utils_1 = require("./utils");
/**
 *
 * @param langObj 待翻译的语言文件对象
 * @returns {key:string,value:string}[]
 */
function convertLangInfoToList(langObj) {
    const langItemList = [];
    function searchObj(obj, pathList) {
        for (const key in obj) {
            const langVal = obj[key];
            if (!langVal) {
                continue;
            }
            if (typeof langVal === 'string') {
                const namePath = [...pathList, key];
                if (!utils_1.isImage(langVal)) {
                    langItemList.push({
                        name: namePath.join('.'),
                        value: langVal,
                    });
                }
            }
            else if (langVal instanceof Array) {
                searchArray(langVal, pathList, key);
            }
            else {
                const namePath = [...pathList, key];
                // object
                searchObj(langVal, namePath);
            }
        }
    }
    function searchArray(langVal, pathList, key) {
        langVal.forEach((item, idx) => {
            const path = [...pathList, `${key}[${idx}]`];
            if (typeof item === 'string' || typeof item === 'number') {
                if (!utils_1.isImage(item)) {
                    langItemList.push({
                        name: path.join('.'),
                        value: item,
                    });
                }
            }
            else if (item instanceof Array) {
                searchArray(item, pathList, `${key}[${idx}]`);
            }
            else {
                // obj
                searchObj(item, path);
            }
        });
    }
    searchObj(langObj, []);
    // console.log('[LANGLIST]', langItemList)
    return langItemList;
}
exports.convertLangInfoToList = convertLangInfoToList;
function convertPlainLangInfoToLangInfo(plainLangInfoMap, _langResult) {
    const langResult = _langResult || {};
    for (let fieldPathName in plainLangInfoMap) {
        setLangResult(langResult, fieldPathName, plainLangInfoMap[fieldPathName]);
    }
    return langResult;
}
exports.convertPlainLangInfoToLangInfo = convertPlainLangInfoToLangInfo;
/**
 * 根据路径设置语言对象的值
 * @param namePath
 * @param langValue
 * @param langResult
 */
function setLangResult(langResult, namePath, langValue) {
    const namePathList = utils_1.convertNamePath(namePath);
    if (!langValue) {
        return {
            namePath,
            langName: '',
            reason: 'NoData',
        };
    }
    if (!namePathList) {
        return {
            namePath,
            langName: '',
            reason: 'InvalidNamePath',
        };
    }
    let curObj = langResult;
    function isLast(idx) {
        return namePathList.length - 1 === idx;
    }
    namePathList.forEach((pathItem, idx) => {
        if (isLast(idx)) {
            curObj[pathItem] = langValue; // finished
        }
        else {
            const parentObj = curObj;
            curObj = parentObj[pathItem];
            if (!curObj) {
                if (typeof namePathList[idx + 1] === 'number') {
                    //array
                    curObj = [];
                }
                else {
                    // object
                    curObj = {};
                }
                parentObj[pathItem] = curObj;
            }
        }
    });
}

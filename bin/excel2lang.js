"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertExcelToFile = exports.convertSheetToTsFiles = exports.convertSheetToJsonModuleFiles = exports.convertSheetToJsonFiles = exports.updateLangsInfoModelFromSheetData = exports.readSheetDataFromExcel = void 0;
const node_xlsx_1 = __importDefault(require("node-xlsx"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const LangsInfoModel_1 = __importDefault(require("./LangsInfoModel"));
const typescript_1 = __importDefault(require("./template/typescript"));
const json_1 = __importDefault(require("./template/json"));
const xml_1 = __importDefault(require("./template/xml"));
const convert_utils_1 = require("./convert-utils");
const doT = require('dot');
doT.templateSettings.strip = false;
// import fs from 'fs'
function readSheetDataFromExcel(filePath, sheetIdx) {
    const workSheets = node_xlsx_1.default.parse(filePath);
    return workSheets[sheetIdx].data;
}
exports.readSheetDataFromExcel = readSheetDataFromExcel;
//#region convertPlainLangsInfoFromSheetData
const TAG_IGNORE = '{IGNORE}';
const TAG_CONTINUE = '{CONTINUE}';
function normalizePathNameOrDirectiveTag(strId) {
    return (strId || TAG_IGNORE).trim() || TAG_IGNORE;
}
/**
 * 查找定位CELL(从左上角向右下角找)
 * @param sheedData
 */
function findAnchorCell(sheetData, anchorCellTag = convert_utils_1.DEFAULT_ID_TAG) {
    for (let r = 0; r < sheetData.length; r++) {
        const row = sheetData[r];
        for (let c = 0; c < row.length; c++) {
            let cell = row[c];
            if (cell) {
                cell = cell.trim();
                if (cell === anchorCellTag) {
                    return [r, c];
                }
            }
        }
    }
}
/**
 *  excel文件--> 多语言kv
 * 支持一行有多个key
 * @param sheetData
 * @param sheetResult
 * @param options
 */
function updateLangsInfoModelFromSheetData(sheetData, sheetResult, options) {
    const anchorCellPos = (options || {}).anchorCellPos || findAnchorCell(sheetData);
    if (!anchorCellPos) {
        throw new Error('Cant find [[ID]] cell (Anchor Cell)');
    }
    const [langRowIdx, idColIdx] = anchorCellPos;
    const langSummaryInfoList = convertLangSummaryInfoRowList(sheetData[langRowIdx], idColIdx + 1);
    function convertLangSummaryInfoRowList(row, fromIdCol) {
        const result = [];
        for (let idx = fromIdCol; idx < row.length; idx++) {
            let cell = row[idx];
            if (!cell) {
                continue;
            }
            cell = cell.trim();
            if (cell.includes('[') || cell.includes(']')) {
                continue;
            }
            result.push({
                name: cell,
                col: idx,
            });
        }
        return result;
    }
    let result = sheetResult;
    if (!result) {
        result = new LangsInfoModel_1.default();
    }
    for (let rowIdx = langRowIdx + 1; rowIdx < sheetData.length; rowIdx++) {
        const row = sheetData[rowIdx];
        const rawId = row[idColIdx];
        if (!rawId) {
            continue;
        }
        const idList = normalizeIDSearchInfo(rawId);
        // id: simpleId
        // id: 复杂Id
        langSummaryInfoList.forEach((summaryItem) => {
            const langStrVal = row[summaryItem.col];
            // 解析val
            const langStrValList = (langStrVal || '').replace(/\r/g, '').split('\n');
            idList.forEach((idSearchInfo) => {
                let curVal = langStrVal;
                if (!(idSearchInfo.toIdx === -1 && idSearchInfo.fromIdx === 0)) {
                    const strValList = langStrValList.slice(idSearchInfo.fromIdx, idSearchInfo.toIdx === -1 ? undefined : idSearchInfo.toIdx + 1);
                    curVal = strValList.join('\r\n');
                }
                result === null || result === void 0 ? void 0 : result.setLangField(summaryItem.name, idSearchInfo.namePath, curVal);
            });
        });
    }
    function normalizeIDSearchInfo(idCellStr) {
        const idList = idCellStr.trim().replace(/\r/g, '').split('\n');
        const result = [];
        if (idList.length === 1) {
            // 简单ID，所有内容都是值
            result.push({
                fromIdx: 0,
                toIdx: -1,
                namePath: idList[0],
            });
            return result;
        }
        for (let iLine = 0; iLine < idList.length; iLine++) {
            let rowIdLine = normalizePathNameOrDirectiveTag(idList[iLine]);
            if (rowIdLine === TAG_IGNORE) {
                continue;
            }
            else {
                const item = {
                    fromIdx: iLine,
                    toIdx: iLine,
                    namePath: rowIdLine,
                };
                while (iLine + 1 < idList.length) {
                    let curTag = normalizePathNameOrDirectiveTag(idList[iLine + 1]);
                    if (curTag === TAG_CONTINUE) {
                        iLine++;
                        item.toIdx++;
                    }
                    else if (curTag === TAG_IGNORE) {
                        iLine++;
                        continue;
                    }
                    else {
                        break;
                    }
                }
                result.push(item);
            }
        }
        return result;
    }
    return result;
}
exports.updateLangsInfoModelFromSheetData = updateLangsInfoModelFromSheetData;
/**
 * 一个语言包一个模块一个文件
 * @param langsInfoModel
 * @param moduleContentConvertor
 * @param options
 */
function _convertSheetToModuleFiles(langsInfoModel, moduleContentConvertor, options) {
    const { output, getFileName: _getFileName, clear } = options || {};
    const pathStr = path_1.default.normalize(output || path_1.default.resolve(process.cwd(), './dist-lang'));
    const getFileName = _getFileName || createGetFilePathFunc('.json');
    if (clear) {
        fs_1.default.rmdirSync(pathStr, {
            recursive: true,
        });
    }
    if (!fs_1.default.existsSync(pathStr)) {
        fs_1.default.mkdirSync(pathStr);
    }
    langsInfoModel.forEachModule(({ moduleObj, moduleName, langName, langModel }) => {
        const filePath = getFileName({
            langName,
            moduleName: moduleName || undefined,
            destDirPath: pathStr,
        });
        if (filePath) {
            console.log('Start create', filePath);
            let strContent = moduleContentConvertor({
                langName,
                moduleName,
                moduleObj,
                moduleJsonString: JSON.stringify(moduleObj, null, 2),
                destDirPath: pathStr
            });
            utils_1.tryToSaveFileSync(filePath, strContent);
        }
    });
}
function _convertSheetToModuleFilesByTemplate(langsInfoModel, templateContent, templateExt, options) {
    const getFileName = (options === null || options === void 0 ? void 0 : options.getFileName) || createGetFilePathFunc(templateExt);
    _convertSheetToModuleFiles(langsInfoModel, doT.template(templateContent), Object.assign(Object.assign({}, options), { getFileName }));
}
/**
 * 一个语言包一个文件
 */
function _convertSheetToFiles(langsInfoModel, contentTemplate, templateExt, options) {
    const { output, getFileName: _getFileName } = options || {};
    const pathStr = path_1.default.normalize(output || path_1.default.resolve(process.cwd(), './dist-lang'));
    const getFileName = _getFileName || createGetFilePathFunc(templateExt);
    if (!fs_1.default.existsSync(pathStr)) {
        fs_1.default.mkdirSync(pathStr);
    }
    langsInfoModel.forEachLang((model, langName) => {
        const filePath = getFileName({
            langName,
            destDirPath: pathStr,
        });
        const moduleObj = model.toLangObj();
        let strContent = doT.template(contentTemplate)({
            langName,
            destDirPath: pathStr,
            moduleJsonString: JSON.stringify(moduleObj, null, 2),
            fieldsList: model.fieldsList,
            moduleObj: moduleObj
        });
        if (filePath) {
            utils_1.tryToSaveFileSync(filePath, strContent);
        }
    });
}
function convertSheetToJsonFiles(langsInfoModel, options) {
    _convertSheetToFiles(langsInfoModel, json_1.default, '.json', options);
}
exports.convertSheetToJsonFiles = convertSheetToJsonFiles;
function createGetFilePathFunc(extStr) {
    return function (info) {
        const { langName, moduleName, destDirPath, } = info;
        const filePath = path_1.default.resolve(destDirPath, `./${moduleName || ''}`, langName + (extStr || '.json'));
        return filePath;
    };
}
function convertSheetToJsonModuleFiles(langsInfoModel, options) {
    _convertSheetToModuleFiles(langsInfoModel, (data) => {
        const { moduleObj } = data;
        return JSON.stringify(moduleObj, null, 2);
    }, options);
}
exports.convertSheetToJsonModuleFiles = convertSheetToJsonModuleFiles;
function convertSheetToTsFiles(langsInfoModel, options) {
    _convertSheetToModuleFilesByTemplate(langsInfoModel, typescript_1.default, '.ts', options);
}
exports.convertSheetToTsFiles = convertSheetToTsFiles;
//#endregion
//#region 模板文件
/**
 * 模板文件
 * @param template
 * @param sheetIdx
 * @param options
 */
function readTemplateFieldsSet(template, sheetIdx, options) {
    const templateFieldsSet = new Set();
    if (template) {
        if (!fs_1.default.existsSync(template)) {
            throw new Error('template file is not exist:' + template);
        }
        const sheetData = readSheetDataFromExcel(template, sheetIdx || 0);
        const templateModel = updateLangsInfoModelFromSheetData(sheetData, undefined, options);
        templateModel.forEachField((fieldItem) => {
            templateFieldsSet.add(fieldItem.fieldName);
        });
        return templateFieldsSet;
    }
}
//#endregion
function convertExcelToFile(filePathList, options) {
    const _a = options || {}, { template, sheetIdx, fileType, customTemplatePath } = _a, restOptions = __rest(_a, ["template", "sheetIdx", "fileType", "customTemplatePath"]);
    const templateFieldsSet = readTemplateFieldsSet(template, sheetIdx || 0, restOptions);
    const sheetResult = new LangsInfoModel_1.default();
    filePathList.forEach((filePath) => {
        const sheetData = readSheetDataFromExcel(filePath, sheetIdx || 0);
        // 2.将表格数据转换为多语言包
        updateLangsInfoModelFromSheetData(sheetData, sheetResult, restOptions);
    });
    if (templateFieldsSet) {
        // 按templateFieldsMap改造sheetResult
        sheetResult.normalizeByTemplate(templateFieldsSet, restOptions);
    }
    // 3. 转成文件
    switch (fileType) {
        case 'ts':
            convertSheetToTsFiles(sheetResult, restOptions);
            break;
        case 'json-module':
            convertSheetToJsonModuleFiles(sheetResult, restOptions);
            break;
        case 'custom':
        case 'custom-module':
            if (!customTemplatePath || !fs_1.default.existsSync(customTemplatePath)) {
                throw new Error('customTemplatePath not defined');
            }
            let templateContent = fs_1.default.readFileSync(customTemplatePath, 'utf-8');
            let templateExt = path_1.default.extname(customTemplatePath);
            if (fileType === 'custom-module') {
                _convertSheetToModuleFilesByTemplate(sheetResult, templateContent, templateExt, restOptions);
            }
            else {
                _convertSheetToFiles(sheetResult, templateContent, templateExt, restOptions);
            }
            break;
        case 'xml':
            _convertSheetToFiles(sheetResult, xml_1.default, '.xml', options);
            break;
        case 'json':
        default:
            convertSheetToJsonFiles(sheetResult, restOptions);
            break;
    }
}
exports.convertExcelToFile = convertExcelToFile;

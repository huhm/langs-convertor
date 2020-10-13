"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLangModuleMapByFileGlob = exports.convertMultiLangsToExcel = exports.convertToExcel = exports.convertMultiLangsLangItemsMapToExcel = exports.convertLangItemsToExcel = void 0;
const node_xlsx_1 = __importDefault(require("node-xlsx"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const convert_utils_1 = require("./convert-utils");
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
function convertLangItemsToExcel(list, options) {
    const { langNameListToTranslate, langTitleListToTranslate, sheetName, output, } = options || {};
    var xlsxData = [];
    if (langTitleListToTranslate) {
        xlsxData.push(['FieldPath(Dont modify!)', 'Content To Translate', ...langTitleListToTranslate]);
    }
    else {
        xlsxData.push([]);
    }
    xlsxData.push(['[[ID]]', '[Content To Translate]', ...(langNameListToTranslate || [])]);
    list.forEach((item) => {
        xlsxData.push([item.name, item.value]);
    });
    const xlsxFile = node_xlsx_1.default.build([
        {
            name: sheetName || 'default',
            data: xlsxData,
        },
    ]);
    let filePath = path_1.default.join(process.cwd(), output || './lang.xlsx');
    utils_1.tryToSaveFileSync(filePath, new Uint8Array(xlsxFile));
}
exports.convertLangItemsToExcel = convertLangItemsToExcel;
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
function convertMultiLangsLangItemsMapToExcel(langMap, options) {
    const { sheetName, output, } = options || {};
    const idRowIdx = 0;
    var xlsxData = [['[[ID]]']]; // 语言标题行
    const fieldRowIdxMap = {};
    let langIdx = xlsxData[idRowIdx].length;
    for (let langName in langMap) {
        const langList = langMap[langName];
        xlsxData[idRowIdx][langIdx] = langName;
        langList.forEach((item) => {
            let curFieldRowIdx = fieldRowIdxMap[item.name];
            if (curFieldRowIdx == null) {
                xlsxData.push([item.name]);
                curFieldRowIdx = xlsxData.length - 1;
                fieldRowIdxMap[item.name] = curFieldRowIdx;
            }
            xlsxData[curFieldRowIdx][langIdx] = item.value;
        });
        langIdx++;
    }
    const xlsxFile = node_xlsx_1.default.build([
        {
            name: sheetName || 'default',
            data: xlsxData,
        },
    ]);
    let filePath = path_1.default.join(process.cwd(), output || './lang-base.xlsx');
    utils_1.tryToSaveFileSync(filePath, new Uint8Array(xlsxFile));
}
exports.convertMultiLangsLangItemsMapToExcel = convertMultiLangsLangItemsMapToExcel;
function convertToExcel(langObj, options) {
    const list = convert_utils_1.convertLangInfoToList(langObj);
    convertLangItemsToExcel(list, options);
    return list;
}
exports.convertToExcel = convertToExcel;
/**
 * 多语言列表生成excel
 * @param langMap
 * @param options
 */
function convertMultiLangsToExcel(langMap, options) {
    const langMap2 = {};
    for (let langName in langMap) {
        langMap2[langName] = convert_utils_1.convertLangInfoToList(langMap[langName]);
    }
    convertMultiLangsLangItemsMapToExcel(langMap2, options);
    return langMap2;
}
exports.convertMultiLangsToExcel = convertMultiLangsToExcel;
/**
 * 生成多语言模块对象
 * @param fileGlobPath e.g:"./local\/**\/*.json"
 * @param convertToLangJson (strContent)=>JSON.parse(strContent)
 * @param basePath 模块开始路径，basePath之后的路径将转化为模块名 "./local"
 * {[langName]:{path1:{path2:json}}}
 */
function createLangModuleMapByFileGlob(fileGlobPath, options) {
    const { convertToLangJson, basePath } = options;
    const fileContentMap = utils_1.globFilesContentSync(fileGlobPath);
    const jsonMap = {};
    for (let filePath in fileContentMap) {
        let langName = '';
        let modulePathList;
        if (typeof basePath === 'string') {
            const rPath = path_1.default.normalize(path_1.default.relative(basePath, filePath));
            langName = path_1.default.basename(rPath, path_1.default.extname(rPath));
            modulePathList = rPath.split('\\');
            modulePathList.pop();
        }
        else {
            const langPathInfo = basePath(filePath);
            langName = langPathInfo.langName;
            modulePathList = langPathInfo.modulePathList;
        }
        const jsonObj = convertToLangJson(fileContentMap[filePath]);
        if (modulePathList.length === 0) {
            jsonMap[langName] = jsonObj;
        }
        else {
            let curMap = (jsonMap[langName] || {});
            let lastMap = jsonMap;
            jsonMap[langName] = curMap;
            modulePathList.forEach((pathItem) => {
                if (!curMap[pathItem]) {
                    curMap[pathItem] = {};
                }
                lastMap = curMap;
                curMap = curMap[pathItem];
            });
            lastMap[modulePathList[modulePathList.length - 1]] = jsonObj;
        }
    }
    return jsonMap;
}
exports.createLangModuleMapByFileGlob = createLangModuleMapByFileGlob;

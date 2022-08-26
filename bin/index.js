"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertExcelToLangsInfoModel = exports.readSheetsFromExcel = exports.convertExcelToFile = exports.readSheetDataFromExcel = exports.convertSheetToTsFiles = exports.convertSheetToJsonFiles = exports.convertLangInfoToList = exports.globFilesContentSync = exports.globFilesPath = exports.globFilesPathSync = void 0;
const excel2lang_1 = require("./excel2lang");
Object.defineProperty(exports, "convertSheetToJsonFiles", { enumerable: true, get: function () { return excel2lang_1.convertSheetToJsonFiles; } });
Object.defineProperty(exports, "convertSheetToTsFiles", { enumerable: true, get: function () { return excel2lang_1.convertSheetToTsFiles; } });
Object.defineProperty(exports, "readSheetDataFromExcel", { enumerable: true, get: function () { return excel2lang_1.readSheetDataFromExcel; } });
Object.defineProperty(exports, "convertExcelToFile", { enumerable: true, get: function () { return excel2lang_1.convertExcelToFile; } });
Object.defineProperty(exports, "readSheetsFromExcel", { enumerable: true, get: function () { return excel2lang_1.readSheetsFromExcel; } });
Object.defineProperty(exports, "convertExcelToLangsInfoModel", { enumerable: true, get: function () { return excel2lang_1.convertExcelToLangsInfoModel; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "globFilesPathSync", { enumerable: true, get: function () { return utils_1.globFilesPathSync; } });
Object.defineProperty(exports, "globFilesPath", { enumerable: true, get: function () { return utils_1.globFilesPath; } });
Object.defineProperty(exports, "globFilesContentSync", { enumerable: true, get: function () { return utils_1.globFilesContentSync; } });
var convert_utils_1 = require("./convert-utils");
Object.defineProperty(exports, "convertLangInfoToList", { enumerable: true, get: function () { return convert_utils_1.convertLangInfoToList; } });
__exportStar(require("./lang2excel"), exports);
// const sheetData=readSheetDataFromExcel('C:\\Users\\Administrator\\Desktop\\GPH5翻译.xlsx',1)
// const sheetResult =convertLangsInfoFromSheetData(sheetData,{
//  idCol:0,
//  langNameRow:1
// })
// convertSheetToTsFiles(sheetResult,{clear:true});

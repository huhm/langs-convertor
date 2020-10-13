"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeProcessArg = exports.globFilesContentSync = exports.globFilesPathSync = exports.getExistFileListByFileListPath = exports.globFilesPath = exports.tryToSaveFileSync = exports.isImage = exports.convertNamePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
// /**
//  * 移除字符串前后的空格和\r
//  * @param str
//  */
// export function trimStr(str: string) {
//   if (!str) {
//     return str
//   }
//   const contentIdxTuple = [0, str.length - 1]
//   const dirList = [1, -1]
//   dirList.forEach((dir, tupleIdx) => {
//     let idx = contentIdxTuple[tupleIdx]
//     for (
//       ;
//       idx <= contentIdxTuple[1] && idx >= contentIdxTuple[0];
//       idx += dir
//     ) {
//         if(str[idx]===' '|| str[idx]==='\r'){
//         }
//     }
//   })
//   return str.substr(
//     contentIdxTuple[0],
//     contentIdxTuple[1] - contentIdxTuple[0] + 1
//   )
// }
/**
 * 转换异常，返回null
 * @param namePath
 */
function convertNamePath(namePath) {
    const result = [];
    if (!namePath) {
        return result;
    }
    const matches = namePath.trim().match(/(\w+)|(\[(\d+)\])/g);
    matches.forEach((item) => {
        if (item[0] === '[') {
            const arrayIdx = parseInt(item.substr(1), 10);
            if (isNaN(arrayIdx)) {
                return null;
            }
            result.push(arrayIdx);
        }
        else {
            result.push(item);
        }
    });
    return result;
}
exports.convertNamePath = convertNamePath;
function isImage(str) {
    if (!str) {
        return false;
    }
    if (typeof str !== 'string') {
        return false;
    }
    if (str.startsWith('data:image/png;')) {
        return true;
    }
    if (str.startsWith('static/img')) {
        return true;
    }
    return false;
}
exports.isImage = isImage;
function tryToSaveFileSync(filePath, data, options) {
    const fileDirPath = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(fileDirPath)) {
        fs_1.default.mkdirSync(fileDirPath);
    }
    fs_1.default.writeFileSync(filePath, data, options);
}
exports.tryToSaveFileSync = tryToSaveFileSync;
function globFilesPath(globPath) {
    return new Promise((resolve, reject) => {
        glob_1.default(globPath, {}, function (err, files) {
            if (err) {
                reject(err);
                return;
            }
            resolve(files);
        });
    });
}
exports.globFilesPath = globFilesPath;
function getExistFileListByFileListPath(fileListPath) {
    let fileList = [];
    fileListPath.forEach((item) => {
        let fList = globFilesPathSync(item);
        fileList = fileList.concat(fList);
        // fList.forEach((filePath) => {
        //   if (fs.existsSync(filePath)) {
        //   }
        // })
    });
    return fileList;
}
exports.getExistFileListByFileListPath = getExistFileListByFileListPath;
function globFilesPathSync(globPath) {
    return glob_1.default.sync(globPath, {
        sync: true
    });
}
exports.globFilesPathSync = globFilesPathSync;
function globFilesContentSync(globPath) {
    const fileContentMap = {};
    const filePathList = globFilesPathSync(globPath);
    filePathList.forEach(item => {
        fileContentMap[item] = fs_1.default.readFileSync(item, 'utf-8');
    });
    return fileContentMap;
}
exports.globFilesContentSync = globFilesContentSync;
function normalizeProcessArg(strArg) {
    if (!strArg) {
        return strArg;
    }
    let result = strArg.trim();
    if (result[0] === '\'' || result[0] === '"') {
        result = result.slice(1, -1);
    }
    return result;
}
exports.normalizeProcessArg = normalizeProcessArg;

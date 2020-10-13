import fs,{WriteFileOptions} from 'fs'
import path from 'path'
import glob from 'glob'
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
export function convertNamePath(namePath: string) {
  const result: (string | number)[] = []
  if (!namePath) {
    return result
  }
  const matches = namePath.trim().match(/(\w+)|(\[(\d+)\])/g)
  matches!.forEach((item) => {
    if (item[0] === '[') {
      const arrayIdx = parseInt(item.substr(1), 10)
      if (isNaN(arrayIdx)) {
        return null
      }
      result.push(arrayIdx)
    } else {
      result.push(item)
    }
  })
  return result
}

export function isImage(str: string|number) {
  if (!str) {
    return false
  }
  if(typeof str !=='string'){
    return false;
  }
  if (str.startsWith('data:image/png;')) {
    return true
  }
  if (str.startsWith('static/img')) {
    return true
  }
  return false
}
 

export function tryToSaveFileSync(filePath:string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions){
  const fileDirPath = path.dirname(filePath)
  if(!fs.existsSync(fileDirPath)){
    fs.mkdirSync(fileDirPath)
  }
  fs.writeFileSync(filePath, data,options)
}

export function globFilesPath(globPath:string){
  return new Promise<string[]>((resolve,reject)=>{
    glob(globPath,{},function(err,files){
      if(err){
        reject(err)
        return
      }
      resolve(files)
    })
  })
}

export function getExistFileListByFileListPath(fileListPath: string[]) {
  let fileList = [] as string[] 
  fileListPath.forEach((item) => {
    let fList = globFilesPathSync(item) 
    fileList=fileList.concat(fList)
    // fList.forEach((filePath) => {
    //   if (fs.existsSync(filePath)) {
    //   }
    // })
  })
  return fileList
}
export function globFilesPathSync(globPath:string){
  return glob.sync(globPath,{
    sync:true
  })
}

export function globFilesContentSync(globPath:string){
  const fileContentMap={} as {[filePath:string]:string}
  const filePathList=globFilesPathSync(globPath)
  filePathList.forEach(item=>{
    fileContentMap[item]=fs.readFileSync(item,'utf-8')
  })
  return fileContentMap
}

export function normalizeProcessArg(strArg:string){
  if(!strArg){
    return strArg
  }
  let result=strArg.trim();
  if(result[0]==='\''|| result[0]==='"'){
    result=result.slice(1,-1)
  }
  return result
}
import { convertSheetToJsonFiles, convertSheetToTsFiles, readSheetDataFromExcel,convertExcelToFile } from "./excel2lang";
 

export {globFilesPathSync,globFilesPath,globFilesContentSync} from './utils'

export {convertLangInfoToList} from './convert-utils'

export { convertSheetToJsonFiles, convertSheetToTsFiles, readSheetDataFromExcel ,convertExcelToFile}

export * from './lang2excel'
// const sheetData=readSheetDataFromExcel('C:\\Users\\Administrator\\Desktop\\GPH5翻译.xlsx',1)
// const sheetResult =convertLangsInfoFromSheetData(sheetData,{
//  idCol:0, 
//  langNameRow:1
// })
// convertSheetToTsFiles(sheetResult,{clear:true});

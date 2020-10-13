import xlsx from 'node-xlsx'
import {
  ILangObj,
  ILangObjValueTypeBase,
  LangSummaryInfo,
} from './interface'
import { tryToSaveFileSync } from './utils'
import path from 'path'
import fs from 'fs'
import LangsInfoModel from './LangsInfoModel';
import TS_TEMPLATE from './template/typescript'
import JSON_TEMPLATE from './template/json'
import XML_TEMPLATE from './template/xml'

const doT =require('dot')

doT.templateSettings.strip=false
// import fs from 'fs'
export function readSheetDataFromExcel(filePath: string, sheetIdx: number) {
  const workSheets = xlsx.parse(filePath)
  return workSheets[sheetIdx].data
}


//#region convertPlainLangsInfoFromSheetData

const TAG_IGNORE = '{IGNORE}'
const TAG_CONTINUE = '{CONTINUE}'
function normalizePathNameOrDirectiveTag(strId: string) {
  return (strId || TAG_IGNORE).trim() || TAG_IGNORE
}

 


export interface IConvertLangOption {
  /**
   * 定位ID列和语言行的位置
   * 默认0
   */
  anchorCellPos?: [number,number]
}

/**
 * 查找定位CELL(从左上角向右下角找)
 * @param sheedData 
 */
function findAnchorCell(
  sheetData: string[][],
  anchorCellTag: string = '[[ID]]'
) {
  for(let r=0;r<sheetData.length;r++){
    const row = sheetData[r]
    for(let c=0;c<row.length;c++){
      let cell = row[c]
      if (cell) {
        cell = cell.trim()
        if (cell === anchorCellTag) {
          return [r,c]
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
export function updateLangsInfoModelFromSheetData(
  sheetData: string[][],
  sheetResult?: LangsInfoModel,
  options?: IConvertLangOption
) {
  const anchorCellPos=(options||{}).anchorCellPos || findAnchorCell(sheetData);
  if(!anchorCellPos){
    throw new Error('Cant find [[ID]] cell (Anchor Cell)')
  }
  const [langRowIdx,idColIdx]=anchorCellPos
  const langSummaryInfoList = convertLangSummaryInfoRowList(
    sheetData[langRowIdx],
    idColIdx+1
  )

  function convertLangSummaryInfoRowList(row: string[],fromIdCol:number) {
    const result: LangSummaryInfo[] = []
    for(let idx=fromIdCol;idx<row.length;idx++){
      let cell=row[idx]
      if (!cell) {
        continue
      }
      cell=cell.trim()
      if(cell.includes('[')||cell.includes(']')){
        continue;
      }      
      result.push({
        name: cell,
        col: idx,
      })
    }
    return result
  }
  let result = sheetResult
  if(!result){
    result=new LangsInfoModel()
  }

  for (let rowIdx = langRowIdx+1; rowIdx < sheetData.length; rowIdx++) {
    const row = sheetData[rowIdx]
    const rawId = row[idColIdx]
    if (!rawId) {
      continue
    }
    const idList = normalizeIDSearchInfo(rawId)

    // id: simpleId
    // id: 复杂Id
    langSummaryInfoList.forEach((summaryItem) => {
      const langStrVal = row[summaryItem.col]
      // 解析val
      const langStrValList = (langStrVal || '').replace(/\r/g, '').split('\n')
      idList.forEach((idSearchInfo) => {
        let curVal = langStrVal
        if (!(idSearchInfo.toIdx === -1 && idSearchInfo.fromIdx === 0)) {
          const strValList: string[] = langStrValList.slice(
            idSearchInfo.fromIdx,
            idSearchInfo.toIdx === -1 ? undefined : idSearchInfo.toIdx + 1
          )
          curVal = strValList.join('\r\n')
        }
        result?.setLangField(summaryItem.name,idSearchInfo.namePath,curVal)
      })
    })
  }

  type IDSearchInfo = {
    fromIdx: number
    toIdx: number
    namePath: string
  }
  
  function normalizeIDSearchInfo(idCellStr: string) {
    const idList = idCellStr.trim().replace(/\r/g, '').split('\n')
    const result: IDSearchInfo[] = []
    if (idList.length === 1) {
      // 简单ID，所有内容都是值
      result.push({
        fromIdx: 0,
        toIdx: -1, // 到末尾
        namePath: idList[0],
      })
      return result
    }
    for (let iLine = 0; iLine < idList.length; iLine++) {
      let rowIdLine = normalizePathNameOrDirectiveTag(idList[iLine])
      if (rowIdLine === TAG_IGNORE) {
        continue
      } else {
        const item = {
          fromIdx: iLine,
          toIdx: iLine,
          namePath: rowIdLine,
        }
        while (iLine + 1 < idList.length) {
          let curTag = normalizePathNameOrDirectiveTag(idList[iLine + 1])
          if (curTag === TAG_CONTINUE) {
            iLine++
            item.toIdx++
          } else if (curTag === TAG_IGNORE) {
            iLine++
            continue
          } else {
            break
          }
        }
        result.push(item)
      }
    }
    return result
  }
  
  return result
}
//#endregion

//#region 文件生成


export interface IConvertFileOption {
  /**
   * 默认当前目录的dist-lang
   */
  output?: string
  /**
   * 生成前时候清除目录
   */
  clear?: boolean
  /**
   * 返回为空时，表示忽略该语言包
   */
  getFileName?: (info: {
    langName: string
    destDirPath: string
    moduleName?: string
  }) => string | null

  /**
   * 字段缺失策略
   * none:不设置 (默认)
   * placeholder: 使用missingValue占位符值
   */
  missingMode?: 'none' | 'placeholder'
  missingValue?: string
}



/**
 * 一个语言包一个模块一个文件
 * @param langsInfoModel 
 * @param moduleContentConvertor 
 * @param options 
 */
function _convertSheetToModuleFiles(
  langsInfoModel: LangsInfoModel,
  moduleContentConvertor:(moduleInfo:{
    langName:string,
    moduleName?:string,
    destDirPath: string,
    moduleObj:ILangObj,
    moduleJsonString:string,
  })=>string,
  options?: IConvertFileOption
) {
  const { output, getFileName: _getFileName, clear } = options || {}
  const pathStr = path.normalize(
    output || path.resolve(process.cwd(), './dist-lang')
  )
  const getFileName = _getFileName || createGetFilePathFunc('.json')
  if (clear) {
    fs.rmdirSync(pathStr, {
      recursive: true,
    })
  }
  if (!fs.existsSync(pathStr)) {
    fs.mkdirSync(pathStr)
  }
  langsInfoModel.forEachModule(({moduleObj,moduleName,langName,langModel})=>{
    const filePath = getFileName({
      langName,
      moduleName:moduleName||undefined,
      destDirPath: pathStr,
    })
    if (filePath) {
      console.log('Start create', filePath)

      let strContent =moduleContentConvertor({
        langName,
        moduleName,
        moduleObj,
        moduleJsonString:JSON.stringify(moduleObj, null, 2),
        destDirPath:pathStr
      })
      
      tryToSaveFileSync(filePath, strContent)
    }
  }) 
}
function _convertSheetToModuleFilesByTemplate(
  langsInfoModel: LangsInfoModel,
  templateContent:string,
  templateExt:string,
  options?: IConvertFileOption
) {
  const getFileName = options?.getFileName || createGetFilePathFunc(templateExt)
  
  _convertSheetToModuleFiles(langsInfoModel,doT.template(templateContent),{
    ...options,
    getFileName
  })
}

/**
 * 一个语言包一个文件
 */
function _convertSheetToFiles(langsInfoModel: LangsInfoModel,
  contentTemplate:string,
  templateExt:string,
  options?: IConvertFileOption){
  const { output, getFileName: _getFileName } = options || {}
  const pathStr = path.normalize(
    output || path.resolve(process.cwd(), './dist-lang')
  )
  const getFileName =
    _getFileName || createGetFilePathFunc(templateExt) 
  if (!fs.existsSync(pathStr)) {
    fs.mkdirSync(pathStr)
  }
  langsInfoModel.forEachLang((model,langName)=>{
    const filePath = getFileName({
      langName,
      destDirPath: pathStr,
    })
    const moduleObj=model.toLangObj()
    let strContent = doT.template(contentTemplate)({
      langName,
      destDirPath:pathStr,
      moduleJsonString:JSON.stringify(moduleObj, null, 2),
      fieldsList: model.fieldsList,
      moduleObj:moduleObj
    })
    if (filePath) {
      tryToSaveFileSync(filePath,strContent )
    }
  })
}

export function convertSheetToJsonFiles(
  langsInfoModel: LangsInfoModel,
  options?: IConvertFileOption
) {
  _convertSheetToFiles(langsInfoModel,JSON_TEMPLATE,'.json',options)
}

function createGetFilePathFunc(extStr:string){
  return function (info: {
    langName: string
    moduleName?: string,
    destDirPath: string
  }) {
    const {
      langName,
      moduleName,
      destDirPath,
    }=info;
    const filePath = path.resolve(
      destDirPath,
      `./${moduleName||''}`,
      langName + (extStr||'.json')
    )
    return filePath
  }
}


export function convertSheetToJsonModuleFiles(
  langsInfoModel: LangsInfoModel,
  options?: IConvertFileOption
) {
  _convertSheetToModuleFiles(
    langsInfoModel,
    (data) => {
      const { moduleObj } = data
      return JSON.stringify(moduleObj, null, 2)
    },
    options
  )
}
export function convertSheetToTsFiles(
  langsInfoModel: LangsInfoModel,
  options?: IConvertFileOption
) {
  _convertSheetToModuleFilesByTemplate(langsInfoModel,TS_TEMPLATE,'.ts',options)
}
//#endregion


//#region 模板文件

/**
 * 模板文件
 * @param template 
 * @param sheetIdx 
 * @param options 
 */
function readTemplateFieldsSet(
  template: string | undefined,
  sheetIdx: number,
  options: IConvertLangOption
) {
  const templateFieldsSet=new Set<string>()
  if (template) {
    if (!fs.existsSync(template)) {
      throw new Error('template file is not exist:' + template)
    }
    const sheetData = readSheetDataFromExcel(template, sheetIdx || 0)
    const templateModel = updateLangsInfoModelFromSheetData(
      sheetData,
      undefined,
      options
    )
    templateModel.forEachField((fieldItem)=>{
      templateFieldsSet.add(fieldItem.fieldName)
    })
    return templateFieldsSet
  }
}
 
//#endregion

export function convertExcelToFile(
  filePathList: string[],
  options?: {
    /**
     * 表格位置，默认第0个
     */
    sheetIdx?: number
    /**
     * json： 每个语言一个文件
     * xml: 已有模板 ，每个语言一个文件
     * json-module:已有模板，每个语言每个模块一个文件
     * ts: 已有模板 ，每个语言每个模块一个文件
     * custom: 自定义有模板，每个语言一个文件
     * custom-module: 自定义模板，每个语言一个文件
     */
    fileType: 'json' |'xml' | 'ts' |'json-module' |'custom'|'custom-module',
    /**
     * fileType为custom时有效
     * 自定义的模板路径，生成的文件ext为模板的后缀
     * it对象:{
     *  langName:'语言简称', 
     *  moduleName:'模块名称',
     *  moduleJsonString:'多语言模块对象JSON字符串',
     *  moduleObj:'多语言模块对象JSON对象'
     * }
     */
    customTemplatePath?:string,
    /**
     * 模板字段（只有模板字段中的字段才会被翻译）
     */
    template?: string
  } & IConvertLangOption &
    IConvertFileOption 
) {
  const { template, sheetIdx, fileType,customTemplatePath, ...restOptions } = options || {}
  const templateFieldsSet = readTemplateFieldsSet(
    template,
    sheetIdx || 0,
    restOptions
  )

  const sheetResult = new LangsInfoModel()
  filePathList.forEach((filePath) => {
    const sheetData = readSheetDataFromExcel(filePath, sheetIdx || 0)
    // 2.将表格数据转换为多语言包
    updateLangsInfoModelFromSheetData(sheetData, sheetResult, restOptions)
  })
  if (templateFieldsSet) {
    // 按templateFieldsMap改造sheetResult
    sheetResult.normalizeByTemplate(templateFieldsSet,restOptions) 
  }
  // 3. 转成文件
  switch (fileType) {
    case 'ts':
      convertSheetToTsFiles(sheetResult, restOptions)
      break
    case 'json-module':
      convertSheetToJsonModuleFiles(sheetResult, restOptions)
      break
    case 'custom':
    case 'custom-module':
      if(!customTemplatePath|| !fs.existsSync(customTemplatePath)){
        throw new Error('customTemplatePath not defined')
      }
      let templateContent=fs.readFileSync(customTemplatePath,'utf-8');
      let templateExt=path.extname(customTemplatePath);
      if(fileType==='custom-module'){
        _convertSheetToModuleFilesByTemplate(sheetResult,templateContent,templateExt,restOptions)
      }else{
        _convertSheetToFiles(sheetResult,templateContent,templateExt,restOptions)
      }
        break
    case 'xml':
      _convertSheetToFiles(sheetResult,XML_TEMPLATE,'.xml',options)
      break;
    case 'json':
    default:
      convertSheetToJsonFiles(sheetResult, restOptions)
      break
  }
}

import xlsx from 'node-xlsx'
import { ILangObj } from './interface'
import { globFilesContentSync, tryToSaveFileSync } from './utils'
import path from 'path'
import { ConvertedLangItem, convertLangInfoToList } from './convert-utils'


export interface ILangExcelOption {
  /**
   * 生成的文件地址
   * 默认cwd+'./lang.xlsx'
   */
  output?: string
  /**
   * sheet名称，默认'Default'
   */
  sheetName?: string

  /**
   * 待翻译的语言列表(仅用来生成标题行)
   * en,zh,ar...
   */
  langNameListToTranslate?: string[]

  /**
   * 待翻译的语言列表名称(仅用来生成标题行)
   */
  langTitleListToTranslate?: string[]
}

/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export function convertLangItemsToExcel(
  list: ConvertedLangItem[],
  options?: ILangExcelOption
) {
  const {
    langNameListToTranslate,
    langTitleListToTranslate,
    sheetName,
    output,
  } = options || {}
  var xlsxData: string[][] = []
  if (langTitleListToTranslate) {
    xlsxData.push(['FieldPath(Dont modify!)', 'Content To Translate', ...langTitleListToTranslate])
  }else{
    xlsxData.push([])
  }
  xlsxData.push(['[[ID]]', '[Content To Translate]', ...(langNameListToTranslate || [])])
  list.forEach((item) => {
    xlsxData.push([item.name, item.value])
  })
  const xlsxFile = xlsx.build([
    {
      name: sheetName || 'default',
      data: xlsxData,
    },
  ])
  let filePath = path.join(process.cwd(), output || './lang.xlsx')
  tryToSaveFileSync(filePath, new Uint8Array(xlsxFile))
}

export type IMultiLangExcelOption = Omit<
  ILangExcelOption,
  'langNameListToTranslate' | 'langTitleListToTranslate'
>
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export function convertMultiLangsLangItemsMapToExcel(
  langMap: {
    [langName: string]: ConvertedLangItem[]
  },
  options?: IMultiLangExcelOption
) {
  const {
    sheetName,
    output,
    // namespace
  } = options || {}
  const idRowIdx = 0
  var xlsxData: string[][] = [['[[ID]]']] // 语言标题行

  const fieldRowIdxMap = {} as { [fieldNamePath: string]: number }

  let langIdx = xlsxData[idRowIdx].length
  for (let langName in langMap) {
    const langList = langMap[langName]
    xlsxData[idRowIdx][langIdx] = langName
    langList.forEach((item) => {
      let curFieldRowIdx = fieldRowIdxMap[item.name]
      if (curFieldRowIdx == null) {
        xlsxData.push([item.name])
        curFieldRowIdx = xlsxData.length - 1
        fieldRowIdxMap[item.name] = curFieldRowIdx
      }
      xlsxData[curFieldRowIdx][langIdx] = item.value
    })
    langIdx++
  }
  const xlsxFile = xlsx.build([
    {
      name: sheetName || 'default',
      data: xlsxData,
    },
  ])
  let filePath = path.join(process.cwd(), output || './lang-base.xlsx')
  tryToSaveFileSync(filePath, new Uint8Array(xlsxFile))
}

export function convertToExcel(langObj: ILangObj, options?: ILangExcelOption) {
  const list = convertLangInfoToList(langObj)
  convertLangItemsToExcel(list, options)
  return list
}

/**
 * 多语言列表生成excel
 * @param langMap
 * @param options
 */
export function convertMultiLangsToExcel(
  langMap: { [langName: string]: ILangObj },
  options?: IMultiLangExcelOption
) {
  const langMap2: {
    [langName: string]: ConvertedLangItem[]
  } = {}
  for (let langName in langMap) {
    langMap2[langName] = convertLangInfoToList(langMap[langName])
  }
  convertMultiLangsLangItemsMapToExcel(langMap2, options)
  return langMap2
}

/**
 * 生成多语言模块对象
 * @param fileGlobPath e.g:"./local\/**\/*.json"
 * @param convertToLangJson (strContent)=>JSON.parse(strContent)
 * @param basePath 模块开始路径，basePath之后的路径将转化为模块名 "./local"
 * {[langName]:{path1:{path2:json}}}
 */
export function createLangModuleMapByFileGlob(
  fileGlobPath: string,
  options: {
    convertToLangJson: (fileContent: string) => ILangObj
    basePath:
      | string
      | ((filePath: string) => { modulePathList: string[]; langName: string })
  }
) {
  const { convertToLangJson, basePath } = options
  const fileContentMap = globFilesContentSync(fileGlobPath)
  type LangType = ILangObj | { [moduleName: string]: ILangObj | LangType }
  const jsonMap = {} as { [langName: string]: LangType }
  for (let filePath in fileContentMap) {
    let langName = ''
    let modulePathList: string[]
    if (typeof basePath === 'string') {
      const rPath = path.normalize(path.relative(basePath, filePath))
      langName = path.basename(rPath, path.extname(rPath))
      modulePathList = rPath.split('\\')
      modulePathList.pop()
    } else {
      const langPathInfo = basePath(filePath)
      langName = langPathInfo.langName
      modulePathList = langPathInfo.modulePathList
    }
    const jsonObj = convertToLangJson(fileContentMap[filePath])
    if (modulePathList.length === 0) {
      jsonMap[langName] = jsonObj
    } else {
      let curMap = (jsonMap[langName] || {}) as any
      let lastMap = jsonMap as any
      jsonMap[langName] = curMap
      modulePathList.forEach((pathItem) => {
        if (!curMap[pathItem]) {
          curMap[pathItem] = {}
        }
        lastMap = curMap
        curMap = curMap[pathItem]
      })
      lastMap[modulePathList[modulePathList.length-1]] = jsonObj
    }
  }
  return jsonMap
}

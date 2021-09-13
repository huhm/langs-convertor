import xlsx from 'node-xlsx'
import path from 'path'
import {
  convertLangInfoToList,
  DEFAULT_ID_TAG as ID_TAG, IConvertedLangItem
} from './convert-utils'
import { ILangObj } from './interface'
import LangsInfoModel from './LangsInfoModel'
import { globFilesContentSync, tryToSaveFileSync } from './utils'

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

  // 自定义Excel头,如:[['[[ID]]','en']]
  customHeaders?: string[][]
  langNameListToTranslate?: string[]
}

/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export function convertLangItemsToExcel(
  list: IConvertedLangItem[],
  options?: ILangExcelOption
) {
  const { sheetName, langNameListToTranslate, customHeaders, output } =
    options || {}
  var xlsxData: string[][] = []
  if (customHeaders) {
    xlsxData = xlsxData.concat(customHeaders)
  } else {
    xlsxData.push([
      ID_TAG,
      '[Content To Translate]',
      ...(langNameListToTranslate || []),
    ])
  }
  list.forEach((item) => {
    xlsxData.push([item.name, item.value])
  })
  const xlsxFile = xlsx.build([
    {
      name: sheetName || 'default',
      data: xlsxData,
    },
  ])
  let filePath = path.resolve(process.cwd(), output || './lang.xlsx')
  tryToSaveFileSync(filePath, new Uint8Array(xlsxFile))
}

export type IMultiLangExcelOption = Omit<
  ILangExcelOption,
  'langNameListToTranslate' | 'customHeaders'
>
/**
 * 语言列表生成excel
 * @param list
 * @param options
 */
export function convertMultiLangsLangItemsMapToExcel(
  langMap: {
    [langName: string]: IConvertedLangItem[]
  },
  options?: IMultiLangExcelOption
) {
  const {
    sheetName,
    output,
    // namespace
  } = options || {}
  const idRowIdx = 0
  var xlsxData: string[][] = [[ID_TAG]] // 语言标题行

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
  let filePath = path.resolve(process.cwd(), output || './lang-base.xlsx')
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
    [langName: string]: IConvertedLangItem[]
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
    basePath: string
    | ((filePath: string) => { modulePathList: string[]; langName: string })
  }
) {
  const { convertToLangJson, basePath } = options
  const fileContentMap = globFilesContentSync(fileGlobPath)

  const jsonMap = {} as { [langName: string]: ILangObj }
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
      lastMap[modulePathList[modulePathList.length - 1]] = jsonObj
    }
  }
  return jsonMap
}

/**
 * 从多语言列表中生成语言缺失部分的excel
 * 每个语言包一个文件
 * @param langMap
 * @param options
 */
export function convertSubstractLangsToExcels(
  langMap: { [langName: string]: ILangObj },
  fromLangName: string,
  options?: {
    /**
     * 生成的文件路径（文件名为{langName}.xlsx）
     * 默认值为process.cwd()
     */
    output?: string
    /**
     * sheet名称，默认'Default'
     */
    sheetName?: string
    /**
     * 空数据占位符前缀，以placeholderPrefix开头的数据视为空数据
     */
    placeholderPrefix?: string
  }
) {
  const { output, sheetName, placeholderPrefix } = options || {}
  const langsModel = new LangsInfoModel()
  const excelPathDir = output || path.resolve(process.cwd(), './dist.trans')
  langsModel.setLangFields(fromLangName, langMap[fromLangName])
  const filePath = path.resolve(excelPathDir, `./template_${fromLangName}.xlsx`)
  console.log('Created Complete Excel for ' + fromLangName)
  convertLangItemsToExcel(
    langsModel.getLangInfoModel(fromLangName).fieldsList,
    {
      sheetName: sheetName || fromLangName,
      output: filePath,
      customHeaders: [[ID_TAG, fromLangName]],
    }
  )
  for (let langName in langMap) {
    if (langName === fromLangName) {
      continue
    }
    langsModel.setLangFields(langName, langMap[langName])
    const list = langsModel.substractLangSet(fromLangName, langName, {
      placeholderPrefix,
    })
    const filePath = path.resolve(excelPathDir, `./${langName}.xlsx`)
    console.log('Created Substract Excel for ' + langName)
    convertLangItemsToExcel(list, {
      sheetName: sheetName || langName,
      output: filePath,
      langNameListToTranslate: [langName]
    })
  }
}

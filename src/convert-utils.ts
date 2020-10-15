import {
  ILangConvertErrorInfo,
  ILangObj,
  ILangObjValueTypeBase,
  IPlainLangInfo,
} from './interface'
import { convertNamePath, isImage } from './utils'


export const DEFAULT_ID_TAG='[[ID]]'
export interface IConvertedLangItem{ 
   name: string;
   value: ILangObjValueTypeBase
}

/**
 *
 * @param langObj 待翻译的语言文件对象
 * @returns {key:string,value:string}[]
 */
export function convertLangInfoToList(langObj: ILangObj) {
  const langItemList: IConvertedLangItem[] = []
  function searchObj(obj: ILangObj, pathList: string[]) {
    for (const key in obj) {
      const langVal = obj[key]
      if (!langVal) {
        continue
      }
      if (typeof langVal === 'string') {
        const namePath = [...pathList, key]
        if (!isImage(langVal)) {
          langItemList.push({
            name: namePath.join('.'),
            value: langVal,
          })
        }
      } else if (langVal instanceof Array) {
        searchArray(langVal, pathList, key)
      } else {
        const namePath = [...pathList, key]
        // object
        searchObj(langVal, namePath)
      }
    }
  }
  function searchArray(
    langVal: ILangObjValueTypeBase[] | ILangObj[],
    pathList: string[],
    key: string
  ) {
    langVal.forEach((item: ILangObjValueTypeBase | ILangObj, idx: number) => {
      const path = [...pathList, `${key}[${idx}]`]
      if (typeof item === 'string' || typeof item === 'number') {
        if (!isImage(item)) {
          langItemList.push({
            name: path.join('.'),
            value: item,
          })
        }
      } else if (item instanceof Array) {
        searchArray(item, pathList, `${key}[${idx}]`)
      } else {
        // obj
        searchObj(item, path)
      }
    })
  }

  searchObj(langObj, [])
  // console.log('[LANGLIST]', langItemList)
  return langItemList
}

export function convertPlainLangInfoToLangInfo(
  plainLangInfoMap: IPlainLangInfo,
  _langResult?: ILangObj
) {
  const langResult = _langResult || {}
  for (let fieldPathName in plainLangInfoMap) {
    setLangResult(langResult, fieldPathName, plainLangInfoMap[fieldPathName])
  }
  return langResult
}

/**
 * 根据路径设置语言对象的值
 * @param namePath
 * @param langValue
 * @param langResult
 */

function setLangResult(
  langResult: ILangObj,
  namePath: string,
  langValue: string
) {
  const namePathList = convertNamePath(namePath)
  if (!langValue) {
    return {
      namePath,
      langName: '',
      reason: 'NoData',
    } as ILangConvertErrorInfo
  }
  if (!namePathList) {
    return {
      namePath,
      langName: '',
      reason: 'InvalidNamePath',
    } as ILangConvertErrorInfo
  }
  let curObj = langResult as any
  function isLast(idx: number) {
    return namePathList.length - 1 === idx
  }
  namePathList.forEach((pathItem, idx) => {
    if (isLast(idx)) {
      curObj[pathItem] = langValue // finished
    } else {
      const parentObj = curObj
      curObj = parentObj[pathItem]
      if (!curObj) {
        if (typeof namePathList[idx + 1] === 'number') {
          //array
          curObj = []
        } else {
          // object
          curObj = {}
        }
        parentObj[pathItem] = curObj
      }
    }
  })
}

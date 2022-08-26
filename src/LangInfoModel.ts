import {
  convertLangInfoToList,
  convertPlainLangInfoToLangInfo,
  IConvertedLangItem,
} from './convert-utils'
import { ILangObj, ILangObjValueTypeBase, IPlainLangInfo } from './interface'
import { convertNamePath } from './utils'

export class LangInfoItemModel implements IConvertedLangItem {
  private _fieldName: string
  get fieldName() {
    return this._fieldName
  }
  private _fieldValue: ILangObjValueTypeBase
  constructor(fieldName: string, fieldValue: ILangObjValueTypeBase) {
    this._fieldName = fieldName
    this._fieldValue = fieldValue
  }

  /**
   * 是否是无效字段占位符
   */
  isPlaceHolder = false

  setValue(v: ILangObjValueTypeBase) {
    this._fieldValue = v
  }

  getValue() {
    return this._fieldValue
  }

  getNamePathList() {
    return convertNamePath(this._fieldName)
  }

  //#region IConvertedLangItem
  get name() {
    return this._fieldName
  }

  get value() {
    return this._fieldValue
  }
  //#endregion
}

/**
 * 语言信息实体
 */
export default class LangInfoModel {
  private _langName: string
  private _plainMap: IPlainLangInfo
  private _fieldsList: LangInfoItemModel[]

  get fieldsList() {
    return this._fieldsList
  }
  get langName() {
    return this._langName
  }

  constructor(langName: string) {
    this._langName = langName
    this._plainMap = {}
    this._fieldsList = []
  }

  private findLangItemInList(fieldNamePath: string) {
    let idx = this.indexOfLangItem(fieldNamePath)
    if (idx != null) {
      return this._fieldsList[idx]
    }
  }

  private indexOfLangItem(fieldNamePath: string) {
    for (let i = 0; i < this._fieldsList.length; i++) {
      const item = this._fieldsList[i]
      if (item.fieldName === fieldNamePath) {
        return i
      }
    }
  }

  setFields(langInfo: ILangObj) {
    const list = convertLangInfoToList(langInfo)
    list.forEach((item) => {
      this.setField(item.name, item.value)
    })
  }

  setField(fieldNamePath: string, fieldValue: ILangObjValueTypeBase) {
    const oldVal = this._plainMap[fieldNamePath]
    let fieldItem: LangInfoItemModel
    const newVal = fieldValue || oldVal
    if (this._plainMap[fieldNamePath] === undefined) {
      fieldItem = new LangInfoItemModel(fieldNamePath, fieldValue)
      this._fieldsList.push(fieldItem)
    } else {
      fieldItem = this.findLangItemInList(fieldNamePath)!
      fieldItem.setValue(newVal)
    }
    this._plainMap[fieldNamePath] = newVal
    return fieldItem
  }

  getFieldValue(fieldNamePath: string) {
    return this._plainMap[fieldNamePath]
  }

  isExist(fieldNamePath: string) {
    return !!this._plainMap[fieldNamePath]
  }

  deleteField(fieldNamePath: string) {
    let idx = this.indexOfLangItem(fieldNamePath)
    if (idx != null) {
      this._fieldsList.splice(idx, 1)
    }
    delete this._plainMap[fieldNamePath]
  }

  /**
   * 获取嵌套结构的多语言
   * @returns
   */
  toLangObj() {
    return convertPlainLangInfoToLangInfo(this._plainMap)
  }

  /**
   * 获取打平的key-value的json字符串
   * @returns
   */
  getPlainMapJsonString(space?: string | number | undefined) {
    return JSON.stringify(this._plainMap, null, space)
  }
}

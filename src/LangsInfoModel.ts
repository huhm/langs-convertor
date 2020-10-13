import { ILangObj, ILangObjValueTypeBase, LangsInfo } from './interface'
import LangInfoModel, { LangInfoItemModel } from './LangInfoModel'

export default class LangsInfoModel {
  private _map: { [langName: string]: LangInfoModel }
  constructor() {
    this._map = {}
  }

  private _getOrCreateLangInfoModel(langName: string) {
    let v = this._map[langName]
    if (!v) {
      v = new LangInfoModel(langName)
      this._map[langName] = v
    }
    return v
  }

  setLangField(
    langName: string,
    fieldNamePath: string,
    fieldValue: ILangObjValueTypeBase
  ) {
    const m = this._getOrCreateLangInfoModel(langName)
    return m.setField(fieldNamePath, fieldValue)
  }

  deleteLangField(langName: string, fieldNamePath: string) {
    const m = this._getOrCreateLangInfoModel(langName)
    return m.deleteField(fieldNamePath)
  }

  toLangsInfoObj() {
    let result: LangsInfo = {}
    for (let langName in this._map) {
      result[langName] = this._map[langName].toLangObj()
    }
    return result
  }

  //#region 遍历

  forEachLang(func: (langVal: LangInfoModel, langName: string) => void) {
    for (let langName in this._map) {
      func(this._map[langName], langName)
    }
  }

  /**
   * 遍历字段
   * @param func
   */
  forEachField(func: (fieldItem: LangInfoItemModel, langName: string) => void) {
    this.forEachLang((langVal, langName) => {
      ;[...langVal.fieldsList].forEach((item) => {
        func(item, langName)
      })
    })
  }

  /**
   * 遍历第一层module(fieldNamePath的第一节，如果只有一节，放到root中)
   * @param func
   */
  forEachModule(
    func: (data: {
      moduleObj: ILangObj
      moduleName?: string
      langName: string,
      // fieldsList: LangInfoItemModel[],
      langModel:LangInfoModel
    }) => void
  ) {
    this.forEachLang((langVal, langName) => {
      const rootData = {} as ILangObj
      const langObj = langVal.toLangObj()
      for (let moduleName in langObj) {
        let moduleV = langObj[moduleName]
        if (
          moduleV &&
          typeof moduleV === 'object' &&
          !(moduleV instanceof Array)
        ) {
          // 非基础对象
          func({
            moduleObj: moduleV,
            moduleName,
            langName,
            // fieldsList:langVal.fieldsList,
            langModel:langVal
          })
        } else {
          // 根上的数据
          rootData[moduleName] = moduleV
        }
      }
      if (Object.keys(rootData).length > 0) {
        // TODO 不支持
        func({
          moduleObj: rootData,
          //   moduleName: null,
          langName,
          langModel:langVal
        })
      }
    })
  }
  //#endregion

  //#region normalizeByTemplate
  normalizeByTemplate(
    templateFieldsSet:Set<string>,
    options: {
      /**
       * 字段缺失策略
       * none:不设置
       * placeholder: 使用missingValue占位符值
       */
      missingMode?: 'none' | 'placeholder'
      missingValue?: string
    }
  ) {
    // 1. delete the extra fields
    this.forEachField((fieldItem, langName) => {
      if(!templateFieldsSet.has(fieldItem.fieldName)){
        this.deleteLangField(langName, fieldItem.fieldName)
      }
    })

    // 2. add the exist fields?
    const { missingMode, missingValue } = options
    if (missingMode && missingMode !== 'none') {
      templateFieldsSet.forEach(fieldName=>{
        this.forEachLang((langModel) => {
          if (!langModel.isExist(fieldName)) {
            langModel.setField(fieldName, missingValue!).isPlaceHolder = true
          }
        })
      })
    }
  }
  //#endregion
}

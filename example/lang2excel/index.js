const fs = require('fs')
const path = require('path')
const LangsConvertor = require('../../bin/index')

const { convertToExcel,createLangModuleMapByFileGlob } = LangsConvertor

console.log(__dirname)
const langJsonPath = path.join(__dirname, './lang.json')
const strLang = fs.readFileSync(langJsonPath)
const langObj = JSON.parse(strLang)

const langObjMap = {
    en: '英文-en',
    //   zh: '中文-zh',
    hi: '印地语-hi',
    id: '印度尼西亚语-id',
}
const langNameListToTranslate = []
const langTitleListToTranslate = []
for (const key in langObjMap) {
    langNameListToTranslate.push(key)
    langTitleListToTranslate.push(langObjMap[key])
}
convertToExcel(langObj, {
    output: './dist/lang.xlsx',
    sheetName: 'trans',
    langNameListToTranslate,
    langTitleListToTranslate,
})
const jsonMap = createLangModuleMapByFileGlob(path.join(__dirname,'./local/**/*.json'),{
    convertToLangJson:(strContent)=>JSON.parse(strContent),
    basePath:path.join(__dirname,'./local')
})
console.log(jsonMap)
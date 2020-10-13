# langs-tool

## 命令行方式
1. 安装 ``npm i langs-tool``
2. 使用
``` bash
# 查看帮助文档
npx lang-cvt -h
# 转化xlsx 为json文件
npx lang-cvt -f ./first_lang*.xlsx ./sencond_lang*.xlsx -o ./dist/lang --langNameRow 1 --idCol 0 --templateExcel ./lang_0_template.xlsx
```


## excel格式说明

+ ID列(idCol)： 表示ID所在的列
  + ID列中数据为空时，表示该行不需要翻译
  + ID列支持多对一
    + 一行数据对应多个ID
  + ID列重复时，以后面的ID列数据为准
+ 语言行(langNameRow)：表示语言简称所在的行
  + 语言行**有效语言**定义
    + 从ID列往后一列，同时非空的单元格
    + 有效语言简称不能包含'[' 或 ']'
  + 语言行中所有**有效语言**，都将翻译为一种语言
+ ID列和语言行交叉的Cell为定位锚点
  + 可手动指定 anchorCellPos
  + 也可自动查找表格单元格内容为``[[ID]]``的单元格
+ 有效数据，同时满足以下条件
  + 有效语言所在列
  + 起始行 为**语言行**下一行
  + 所在行对应的ID有值

## excel 转 多语言包
+ 支持多excel转化
+ 支持只转化模板excel中的字段(template)
+ 支持转化文件模板 customTemplatePath


``` js
const path = require('path');
const { convertExcelToFile } = require('langs-tool')

convertExcelToFile(['./excel/v1-complete.xlsx','./excel/v2-id.xlsx','./excel/v2-hi.xlsx'],{
    fileType:'ts',
    template:'./excel/template.xlsx',
    customTemplatePath:'./tpl.txt',
    fileType:'custom-module',
    output:'./dist-lang',
    missingMode:'placeholder',
    missingValue:'[TODO:LACKFIELD]'
})
```

模板定义 tpl.txt
``` txt
langInfo: {{=it.langName}}
moduleName: {{=it.moduleName}}
langObject: {{=it.moduleJsonString}}
```

## 语言包转excel

### 待翻译en语言转excel
``` js
const { convertToExcel } = require('langs-tool')
convertToExcel({
    moduleName:{
        title:'sdfdsf',
        list:['sd','sdf'],
        obj:{
            key1:'sdf'
        }
    },
    module2:{
        title:'sdf'
    }
},{
    output:'./lang.xlsx',
    langNameListToTranslate:[''],
    langTitleListToTranslate:['']
})
```

### 现有语言包转基础excel
``` js
const { convertMultiLangsToExcel,createLangModuleMapByFileGlob } = require('langs-tool')
// 读取现有json 
const fileContentMap=createLangModuleMapByFileGlob('./local/**/*.json',{
    convertToLangJson:(strContent)=>JSON.parse(strContent),
    basePath:path.join(__dirname,'./local')
})// A/en.json,B/SubB/en.json
// const fileContentMap={
//     en:{
//         moduleName:{
//             title:'sdfdsf',
//             list:['sd','sdf'],
//             obj:{
//                 key1:'sdf'
//             }
//         },
//         module2:{
//             title:'sdf'
//         }
//     },
//     id:{
//         ...
//     },
//     hi:{
//         ...
//     }
// }
convertMultiLangsToExcel(fileContentMap,{
    output:'./lang-base.xlsx'
})
```

 

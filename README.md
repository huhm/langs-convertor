# langs-tool
[![npm version](https://badge.fury.io/js/langs-tool.svg)](https://badge.fury.io/js/langs-tool)

## Features
+ excel转json/typescript/自定义模板
  + 支持一行有多个字段KEY()
  + 支持冗余字段删除(templateExcel)
  + 支持未翻译字段占位(missingMode=placeholder)
  + 支持多个文件批量转化
  + 支持字段覆盖
  + 可自动查找ID列和语言行(``[[ID]]``)
  + 支持一个语言一个文件 或 一个语言一个模块(ID第一层KEY)一个文件
+ 多语言json转excel

## 命令行方式
1. 安装 ``npm i langs-tool``
2. 使用
``` bash
# 查看帮助文档
npx lang-cvt -h

# 转化xlsx 为json文件
npx lang-cvt -f ./dist/lang-base-*.xlsx ./dist/lang-v2-*.xlsx --output ./dist  --fileType xml

# 转xlsx 为xml文件 fileType=xml
npx lang-cvt -f ./dist/lang-base-*.xlsx ./dist/lang-v2-*.xlsx --output ./dist --fileType xml

# 转xlsx 为ts文件 fileType=ts
npx lang-cvt -f ./dist/lang-base-*.xlsx ./dist/lang-v2-*.xlsx --output ./dist --templateExcel ./dist/template.xlsx --fileType ts --missingMode placeholder
```


## excel格式说明

+ ID列(idCol)： 表示ID所在的列
  + ID列中数据为空时，表示该行不需要翻译
  + ID列支持多对一
    + 表格的一行数据对应多个ID
    + 通过换行符分隔
    + {IGNORE} 表示忽略该行
    + {CONTINUE} 表示该行合并到上一行ID中
  + ID列重复时，以后面的ID列数据为准
  + ID值规范
    + namePath标识
    + 用``.``标识对象
    + 用``[n]``标识数组
+ 语言行(langNameRow)：表示语言简称所在的行
  + 语言行**有效语言**定义
    + 从ID列往后一列，同时非空的单元格
    + 有效语言简称不能包含'[' 或 ']'
  + 语言行中所有**有效语言**，都将翻译为一种语言
+ ID列和语言行交叉的Cell为定位锚点(anchorCellPos)
  + 可手动指定 
  + 也可自动查找表格单元格内容为``[[ID]]``的单元格
+ 有效数据，同时满足以下条件
  + 有效语言所在列
  + 起始行 为**语言行**下一行
  + 所在行对应的ID有值


1. 多行ID示例
```
// 下面内容表示，前两行内容为FieldName1的值，忽略第三行，第四行内容为FieldName2的值
FieldName1
{CONTINUE}
{IGNORE}
FieldName2
```
2. ID示例
ID:
``` txt
Feedback.title
Feedback.info.foo
Feedback.info.boo
Feedback.questions[0].title
Feedback.questions[1].content
```
对应的json数据
``` json
{
  "Feedback":{
    "title":"",
    "info":{
      "foo":"",
      "boo":""
    },
    "questions":[{
      "title":"",
    },{
      "content":"",
    }]
  }
}
```

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

 

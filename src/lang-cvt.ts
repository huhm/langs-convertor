#!/usr/bin/env node
/**
 * 语言包转换 cmd
 */

import path from 'path'
import program from 'commander'
import { convertExcelToFile } from './excel2lang'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { getExistFileListByFileListPath, normalizeProcessArg } from './utils'
const pkg = require('../package.json')
function getConfirmPromise(msg: string) {
  let confirmQ = [
    {
      type: 'confirm',
      name: 'isConfirmStart',
      message: msg,
      default: false,
    },
  ]

  return inquirer.prompt(confirmQ).then((answers) => {
    return answers.isConfirmStart
  })
}

program.storeOptionsAsProperties(false).passCommandToAction(true)
program.version(pkg.version, '-v, --version')
program
  .usage('[options]')
  .description('convert the excel file to json or ts file')
  .requiredOption('-f, --filePathList <filePathList...>', `excel file path to convert,support glob & array`
  // ,(v,previous)=>{
  //   return previous.concat([v])
  // },[] as string[]
  )
  .option('-z,--templateExcel <templateExcelFile>',`only the fields in templateExcelFile will be outputed into the lang file`)
  .option('-o, --output <outputPath>', `output directory`, './dist.lang/')
  .option('--sheetIdx <sheetIdx>', `sheet number, start at 0`, '0')
  .option('--anchorCellPos <anchorCellPos>', `the anchor Cell,[row,col]`)
 
  .option(
    '-t, --fileType <fileType>',
    `default template fileType json|xml|ts|json-module|custom|custom-module`,
    'json'
  )
  .option(
    '--customTemplatePath <customTemplatePath>',
    `customTemplatePath only used in fileType (custom|custom-module)`
  )
  .option(
    '--missingMode <missingMode>',
    'none or placeholder',
    'none'
  )
  .option(
    '--missingValue <missingValue>',
    'if missingValue is declared, the missingMode is placeholder,only used in the customTemplatePath',
    '[TODO:TRANS]'
  )
  .action((program) => {
    const options = program.opts()
    const {
      langNameRow: _langNameRow,
      sheetIdx: _sheetIdx,
      idCol: _idCol,
      templateExcel,
      // filePath: _filePath,
      // dest: _destDir,
      // customTemplatePath:_customTemplatePath,
      fileType,
      missingValue,
      missingMode
    } = options
    const sheetIdx = parseInt(_sheetIdx, 10)
    // const idCol = parseInt(_idCol, 10)
    // const langNameRow = parseInt(_langNameRow, 10)
    // [_filePath].map(item=>{
    //   return path.resolve(process.cwd(), item)
    // })
    const _filePathList=options.filePathList.map(normalizeProcessArg) 
    const _customTemplatePath=normalizeProcessArg(options.customTemplatePath)
    const filePathList = getExistFileListByFileListPath(_filePathList)
    const output = path.resolve(process.cwd(), normalizeProcessArg(options.output))
    if (filePathList.length===0) {
      console.log(chalk.red('excel 文件不存在！'),_filePathList)
      return
    }
    let anchorCellPos:[number,number]|undefined=undefined;
    if(options.anchorCellPos){
      anchorCellPos=options.anchorCellPos.split(',').map((v:string)=>parseInt(v))
      if(anchorCellPos?.length!==2){
        throw new Error('anchorCellPos参数错误:'+options.anchorCellPos)
      }
    }
    const customTemplatePath=_customTemplatePath&&path.resolve(process.cwd(),_customTemplatePath);
    console.log('即将转化文件:')
    filePathList.forEach((item,idx)=>{
      console.log(idx+1, chalk.blueBright(item))
    }) 
    console.log('  转化表格:', chalk.blue(`第[${sheetIdx}]个表格`))
    if(anchorCellPos){
      console.log('  Id所在列:', chalk.blue(`${anchorCellPos[0]}`))
      console.log('  语言名称所在行:', chalk.blue(`${anchorCellPos[1]}`))
    }else{
      console.log('  Id所在列/语言名称所在行:', chalk.blue(`通过查找[[ID]] 获取`))
    }
    console.log('  文件将被写入:', chalk.blue(`${output}`))
    if(templateExcel){
      console.log('  Excel模板文件:', chalk.blue(templateExcel))
    }
    console.log('  模板文件类型:', chalk.blue(fileType))
    if(customTemplatePath){
      console.log('  模板文件:', chalk.blue(customTemplatePath))
    }
    if(missingMode==='placeholder'){
      console.log(`  模板文件中有的值将以${missingValue}替换`)
    }else{
      console.log('  模板文件中有的值将忽略')
    }
    getConfirmPromise('确认转化吗?').then((isConfirm) => {
      if (isConfirm) {
        convertExcelToFile(filePathList, {
          sheetIdx,
          fileType,
          template:templateExcel,
          customTemplatePath,
          output,
          anchorCellPos,
          missingMode,
          missingValue
        })
        console.log(chalk.green('转化完成:' + output)) 
      }
    })
  })
// program
//   .command('init')
//   .usage('init [options]')
//   .description('init config file')
//   .usage('init [options]')
//   .option('-f, --force', '', true)
//   .action((program) => {
//     const options = program.opts()
//     const { force } = options
//     // create config file
//     // initObj.init(force);
//   })
program.parse(process.argv)

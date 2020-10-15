"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TS_TEMPLATE_TYPE_NAME = "LANGINFO_{{=(it.moduleName||'ROOT').toUpperCase()}}";
const TS_TEMPLATE_MODULE_NAME = "LangInfo{{!it.moduleName}}";
const TS_TEMPLATE = `/* eslint-disable prettier/prettier */
{{? it.langName.toLowerCase()!=='en'}}import { ${TS_TEMPLATE_MODULE_NAME} } from './en'{{?}}
const ${TS_TEMPLATE_TYPE_NAME}{{? it.langName.toLowerCase()!=='en'}}:${TS_TEMPLATE_MODULE_NAME}{{?}} = {{=it.moduleJsonString}}
{{?it.langName.toLowerCase()==='en'}}export type ${TS_TEMPLATE_MODULE_NAME} = typeof ${TS_TEMPLATE_TYPE_NAME}{{?}}
export default ${TS_TEMPLATE_TYPE_NAME}
`;
exports.default = TS_TEMPLATE;

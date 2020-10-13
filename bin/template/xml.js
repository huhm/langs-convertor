"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XML_TEMPLATE = `<resources xmlns:tools="http://schemas.android.com/tools">
{{~it.fieldsList:field:index}}  <string name="{{=field.fieldName}}">{{!field.getValue()}}</string>
{{~}}
</resources>
`;
exports.default = XML_TEMPLATE;

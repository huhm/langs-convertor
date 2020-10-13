declare const XML_TEMPLATE = "<resources xmlns:tools=\"http://schemas.android.com/tools\">\n{{~it.fieldsList:field:index}}  <string name=\"{{=field.fieldName}}\">{{!field.getValue()}}</string>\n{{~}}\n</resources>\n";
export default XML_TEMPLATE;

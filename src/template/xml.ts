const XML_TEMPLATE=`<resources xmlns:tools="http://schemas.android.com/tools">
{{~it.fieldsList:field:index}}  <string name="{{=field.fieldName}}">{{!field.getValue()}}</string>
{{~}}
</resources>
`

export default XML_TEMPLATE
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import produce from 'immer'
import { useBoolean } from 'ahooks'
import { type ToolNodeType, type ToolVarInputs, VarType } from './types'
import { useLanguage } from '@/app/components/header/account-setting/model-provider-page/hooks'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import Toast from '@/app/components/base/toast'
import type { Props as FormProps } from '@/app/components/workflow/nodes/_base/components/before-run-form/form'
import { VarType as VarVarType } from '@/app/components/workflow/types'
import type { InputVar, ValueSelector, Var } from '@/app/components/workflow/types'
import useOneStepRun from '@/app/components/workflow/nodes/_base/hooks/use-one-step-run'
import {
  useFetchToolsData,
  useNodesReadOnly,
} from '@/app/components/workflow/hooks'

const useConfig = (id: string, payload: ToolNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { handleFetchAllTools } = useFetchToolsData()
  const { t } = useTranslation()

  const language = useLanguage()
  const { inputs } = useNodeCrud<ToolNodeType>(id, payload)
  /*
  * tool_configurations: tool setting, not dynamic setting
  * tool_parameters: tool dynamic setting(by user)
  * output_schema: tool dynamic output
  */
  const { provider_type, tool_name, tool_configurations, output_schema } = inputs

  // Auth
  const [showSetAuth, {
    setTrue: showSetAuthModal,
    setFalse: hideSetAuthModal,
  }] = useBoolean(false)

  const handleSaveAuth = useCallback(async (value: any) => {
    Toast.notify({
      type: 'success',
      message: t('common.api.actionSuccess'),
    })
    handleFetchAllTools(provider_type)
    hideSetAuthModal()
  }, [hideSetAuthModal, t, handleFetchAllTools, provider_type])

  const [notSetDefaultValue, setNotSetDefaultValue] = useState(false)
  const toolSettingValue = (() => {
    if (notSetDefaultValue)
      return tool_configurations

    return {}
  })()
  const setToolSettingValue = useCallback((value: Record<string, any>) => {
    setNotSetDefaultValue(true)
  }, [inputs])

  // setting when call
  const setInputVar = useCallback((value: ToolVarInputs) => { }, [inputs])

  const [currVarIndex, setCurrVarIndex] = useState(-1)
  const handleOnVarOpen = useCallback((index: number) => {
    setCurrVarIndex(index)
  }, [])

  const filterVar = useCallback((varPayload: Var) => {
    return varPayload.type !== VarVarType.arrayFile
  }, [])

  // single run
  const [inputVarValues, doSetInputVarValues] = useState<Record<string, any>>({})
  const setInputVarValues = (value: Record<string, any>) => {
    doSetInputVarValues(value)
    // eslint-disable-next-line ts/no-use-before-define
    setRunInputData(value)
  }
  // fill single run form variable with constant value first time
  const inputVarValuesWithConstantValue = () => {
    const res = produce(inputVarValues, (draft) => {
      Object.keys(inputs.tool_parameters).forEach((key: string) => {
        const { type, value } = inputs.tool_parameters[key]
        if (type === VarType.constant && (value === undefined || value === null))
          draft.tool_parameters[key].value = value
      })
    })
    return res
  }

  const {
    isShowSingleRun,
    hideSingleRun,
    getInputVars,
    runningStatus,
    setRunInputData,
    handleRun: doHandleRun,
    handleStop,
    runResult,
  } = useOneStepRun<ToolNodeType>({
    id,
    data: inputs,
    defaultRunInputData: {},
    moreDataForCheckValid: {
      toolInputsSchema: (() => {
        const formInputs: InputVar[] = []
        return formInputs
      })(),
      language,
    },
  })

  const hadVarParams = Object.keys(inputs.tool_parameters)
    .filter(key => inputs.tool_parameters[key].type !== VarType.constant)
    .map(k => inputs.tool_parameters[k])

  const varInputs = getInputVars(hadVarParams.map((p) => {
    if (p.type === VarType.variable) {
      // handle the old wrong value not crash the page
      if (!(p.value as any).join)
        return `{{#${p.value}#}}`

      return `{{#${(p.value as ValueSelector).join('.')}#}}`
    }

    return p.value as string
  }))

  const singleRunForms = (() => {
    const forms: FormProps[] = [{
      inputs: varInputs,
      values: inputVarValuesWithConstantValue(),
      onChange: setInputVarValues,
    }]
    return forms
  })()

  const handleRun = (submitData: Record<string, any>) => {
    const varTypeInputKeys = Object.keys(inputs.tool_parameters)
      .filter(key => inputs.tool_parameters[key].type === VarType.variable)
    const shouldAdd = varTypeInputKeys.length > 0
    if (!shouldAdd) {
      doHandleRun(submitData)
      return
    }
    const addMissedVarData = { ...submitData }
    Object.keys(submitData).forEach((key) => {
      const value = submitData[key]
      varTypeInputKeys.forEach((inputKey) => {
        const inputValue = inputs.tool_parameters[inputKey].value as ValueSelector
        if (`#${inputValue.join('.')}#` === key)
          addMissedVarData[inputKey] = value
      })
    })
    doHandleRun(addMissedVarData)
  }

  const outputSchema = useMemo(() => {
    const res: any[] = []
    if (!output_schema)
      return []
    Object.keys(output_schema.properties).forEach((outputKey) => {
      const output = output_schema.properties[outputKey]
      res.push({
        name: outputKey,
        type: output.type === 'array'
          ? `Array[${output.items?.type.slice(0, 1).toLocaleUpperCase()}${output.items?.type.slice(1)}]`
          : `${output.type.slice(0, 1).toLocaleUpperCase()}${output.type.slice(1)}`,
        description: output.description,
      })
    })
    return res
  }, [output_schema])

  return {
    readOnly,
    inputs,
    toolSettingValue,
    setToolSettingValue,
    setInputVar,
    handleOnVarOpen,
    filterVar,
    showSetAuth,
    showSetAuthModal,
    hideSetAuthModal,
    handleSaveAuth,
    isShowSingleRun,
    hideSingleRun,
    inputVarValues,
    varInputs,
    setInputVarValues,
    singleRunForms,
    runningStatus,
    handleRun,
    handleStop,
    runResult,
    outputSchema,
  }
}

export default useConfig

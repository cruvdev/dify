import useNodeCrud from '../_base/hooks/use-node-crud'
import useVarList from '../_base/hooks/use-var-list'
import useOneStepRun from '../_base/hooks/use-one-step-run'
import type { AgentNodeType } from './types'
import {
  useNodesReadOnly,
} from '@/app/components/workflow/hooks'
import { useCallback, useMemo } from 'react'
import { type ToolVarInputs, VarType } from '../tool/types'
import { useCheckInstalled } from '@/service/use-plugins'
import type { Var } from '../../types'
import { VarType as VarKindType } from '../../types'
import useAvailableVarList from '../_base/hooks/use-available-var-list'

export type StrategyStatus = {
  plugin: {
    source: 'external' | 'marketplace'
    installed: boolean
  }
  isExistInPlugin: boolean
}

const useConfig = (id: string, payload: AgentNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const { inputs, setInputs } = useNodeCrud<AgentNodeType>(id, payload)
  // variables
  const { handleVarListChange, handleAddVariable } = useVarList<AgentNodeType>({
    inputs,
    setInputs,
  })
  const pluginId = inputs.agent_strategy_provider_name?.split('/').splice(0, 2).join('/')
  const pluginDetail = useCheckInstalled({
    pluginIds: [pluginId!],
    enabled: Boolean(pluginId),
  })
  const formData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(inputs.agent_parameters || {}).map(([key, value]) => {
        return [key, value.value]
      }),
    )
  }, [inputs.agent_parameters])
  const onFormChange = (value: Record<string, any>) => {
    const res: ToolVarInputs = {}
    Object.entries(value).forEach(([key, val]) => {
      res[key] = {
        type: VarType.constant,
        value: val,
      }
    })
    setInputs({
      ...inputs,
      agent_parameters: res,
    })
  }

  // vars

  const filterMemoryPromptVar = useCallback((varPayload: Var) => {
    return [
      VarKindType.arrayObject,
      VarKindType.array,
      VarKindType.number,
      VarKindType.string,
      VarKindType.secret,
      VarKindType.arrayString,
      VarKindType.arrayNumber,
      VarKindType.file,
      VarKindType.arrayFile,
    ].includes(varPayload.type)
  }, [])

  const {
    availableVars,
    availableNodesWithParent,
  } = useAvailableVarList(id, {
    onlyLeafNodeVar: false,
    filterVar: filterMemoryPromptVar,
  })

  // single run
  const {
    isShowSingleRun,
    showSingleRun,
    hideSingleRun,
    toVarInputs,
    runningStatus,
    handleRun,
    handleStop,
    runInputData,
    setRunInputData,
    runResult,
    getInputVars,
  } = useOneStepRun<AgentNodeType>({
    id,
    data: inputs,
    defaultRunInputData: {},
  })
  const allVarStrArr = (() => {
    const res: string[] = []
    return res
  })()
  const varInputs = (() => {
    const vars = getInputVars(allVarStrArr)

    return vars
  })()

  const outputSchema = useMemo(() => {
    const res: any[] = []
    if (!inputs.output_schema)
      return []
    Object.keys(inputs.output_schema.properties).forEach((outputKey) => {
      const output = inputs.output_schema.properties[outputKey]
      res.push({
        name: outputKey,
        type: output.type === 'array'
          ? `Array[${output.items?.type.slice(0, 1).toLocaleUpperCase()}${output.items?.type.slice(1)}]`
          : `${output.type.slice(0, 1).toLocaleUpperCase()}${output.type.slice(1)}`,
        description: output.description,
      })
    })
    return res
  }, [inputs.output_schema])

  return {
    readOnly,
    inputs,
    setInputs,
    handleVarListChange,
    handleAddVariable,
    formData,
    onFormChange,
    availableVars,
    availableNodesWithParent,
    isShowSingleRun,
    showSingleRun,
    hideSingleRun,
    toVarInputs,
    runningStatus,
    handleRun,
    handleStop,
    runInputData,
    setRunInputData,
    runResult,
    varInputs,
    outputSchema,
  }
}

export default useConfig

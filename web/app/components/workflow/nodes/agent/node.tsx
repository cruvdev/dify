import { type FC, memo, useMemo } from 'react'
import type { NodeProps } from '../../types'
import type { AgentNodeType } from './types'
import { SettingItem } from '../_base/components/setting-item'
import { Group, GroupLabel } from '../_base/components/group'
import type { ToolIconProps } from './components/tool-icon'
import { ToolIcon } from './components/tool-icon'
import useConfig from './use-config'
import { useTranslation } from 'react-i18next'

const AgentNode: FC<NodeProps<AgentNodeType>> = (props) => {
  const { inputs } = useConfig(props.id, props.data)
  const { t } = useTranslation()
  const models = useMemo(() => {
    if (!inputs) return []
    // if selected, show in node
    // if required and not selected, show empty selector
    // if not required and not selected, show nothing
  }, [inputs])

  const tools = useMemo(() => {
    const tools: Array<ToolIconProps> = []
    return tools
  }, [inputs.agent_parameters])
  return <div className='mb-1 space-y-1 px-3 py-1'>
    {inputs.agent_strategy_name
      ? <SettingItem
        label={t('workflow.nodes.agent.strategy.shortLabel')}
        status={undefined}
        tooltip={undefined}
      >
        {inputs.agent_strategy_label}
      </SettingItem>
      : <SettingItem label={t('workflow.nodes.agent.strategyNotSet')} />}
    {tools.length > 0 && <Group label={<GroupLabel className='mt-1'>
      {t('workflow.nodes.agent.toolbox')}
    </GroupLabel>}>
      <div className='grid grid-cols-10 gap-0.5'>
        {tools.map(tool => <ToolIcon {...tool} key={Math.random()} />)}
      </div>
    </Group>}
  </div>
}

AgentNode.displayName = 'AgentNode'

export default memo(AgentNode)

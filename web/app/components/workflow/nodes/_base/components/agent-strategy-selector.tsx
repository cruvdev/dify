import { PortalToFollowElem, PortalToFollowElemContent, PortalToFollowElemTrigger } from '@/app/components/base/portal-to-follow-elem'
import type { ReactNode } from 'react'
import { memo, useRef, useState } from 'react'
import type { Strategy } from './agent-strategy'
import classNames from '@/utils/classnames'
import { RiErrorWarningFill } from '@remixicon/react'
import Tooltip from '@/app/components/base/tooltip'
import Link from 'next/link'
import ViewTypeSelect, { ViewType } from '../../../block-selector/view-type-select'
import SearchInput from '@/app/components/base/search-input'
import Tools from '../../../block-selector/tools'
import { useTranslation } from 'react-i18next'

const NotFoundWarn = (props: {
  title: ReactNode,
  description: ReactNode
}) => {
  const { title, description } = props

  const { t } = useTranslation()
  return <Tooltip
    popupContent={
      <div className='space-y-1 text-xs'>
        <h3 className='font-semibold text-text-primary'>
          {title}
        </h3>
        <p className='tracking-tight text-text-secondary'>
          {description}
        </p>
        <p>
          <Link href={'/plugins'} className='tracking-tight text-text-accent'>
            {t('workflow.nodes.agent.linkToPlugin')}
          </Link>
        </p>
      </div>
    }
    needsDelay
  >
    <div>
      <RiErrorWarningFill className='size-4 text-text-destructive' />
    </div>
  </Tooltip>
}

export type AgentStrategySelectorProps = {
  value?: Strategy,
  onChange: (value?: Strategy) => void,
}

export const AgentStrategySelector = memo((props: AgentStrategySelectorProps) => {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
  const [viewType, setViewType] = useState<ViewType>(ViewType.flat)
  const [query, setQuery] = useState('')

  const { t } = useTranslation()

  const wrapElemRef = useRef<HTMLDivElement>(null)

  return <PortalToFollowElem open={open} onOpenChange={setOpen} placement='bottom'>
    <PortalToFollowElemTrigger className='w-full'>
      <div
        className='flex h-8 w-full select-none items-center gap-0.5 rounded-lg bg-components-input-bg-normal p-1 hover:bg-state-base-hover-alt'
        onClick={() => setOpen(o => !o)}
      >
        { }
        <p
          className={classNames(value ? 'text-components-input-text-filled' : 'text-components-input-text-placeholder', 'text-xs px-1')}
        >
          {value?.agent_strategy_label || t('workflow.nodes.agent.strategy.selectTip')}
        </p>
      </div>
    </PortalToFollowElemTrigger>
    <PortalToFollowElemContent className='z-10'>
      <div className='w-[388px] overflow-hidden rounded-md border-[0.5px] border-components-panel-border bg-components-panel-bg-blur shadow'>
        <header className='flex gap-1 p-2'>
          <SearchInput placeholder={t('workflow.nodes.agent.strategy.searchPlaceholder')} value={query} onChange={setQuery} className={'w-full'} />
          <ViewTypeSelect viewType={viewType} onChange={setViewType} />
        </header>
        <main className="relative flex w-full flex-col overflow-hidden md:max-h-[300px] xl:max-h-[400px] 2xl:max-h-[564px]" ref={wrapElemRef}>
          <Tools
            viewType={viewType}
            onSelect={(_, tool) => {
              onChange({
                agent_strategy_name: tool!.tool_name,
                agent_strategy_provider_name: tool!.provider_name,
                agent_strategy_label: tool!.tool_label,
                agent_output_schema: tool!.output_schema,
                plugin_unique_identifier: tool!.provider_id,
              })
              setOpen(false)
            }}
            className='h-full max-h-full max-w-none overflow-y-auto'
            indexBarClassName='top-0 xl:top-36' showWorkflowEmpty={false} hasSearchText={false} />
        </main>
      </div>
    </PortalToFollowElemContent>
  </PortalToFollowElem>
})

AgentStrategySelector.displayName = 'AgentStrategySelector'

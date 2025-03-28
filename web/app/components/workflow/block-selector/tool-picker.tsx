'use client'
import type { FC } from 'react'
import React from 'react'
import { useMemo, useState } from 'react'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import type {
  OffsetOptions,
  Placement,
} from '@floating-ui/react'
import AllTools from '@/app/components/workflow/block-selector/all-tools'
import type { ToolDefaultValue, ToolValue } from './types'
import type { BlockEnum } from '@/app/components/workflow/types'
import { useTranslation } from 'react-i18next'
import { useBoolean } from 'ahooks'
import { useAllBuiltInTools, useAllCustomTools, useAllWorkflowTools, useInvalidateAllCustomTools } from '@/service/use-tools'
import cn from '@/utils/classnames'

type Props = {
  panelClassName?: string
  disabled: boolean
  trigger: React.ReactNode
  placement?: Placement
  offset?: OffsetOptions
  isShow: boolean
  onShowChange: (isShow: boolean) => void
  onSelect: (tool: ToolDefaultValue) => void
  supportAddCustomTool?: boolean
  scope?: string
  selectedTools?: ToolValue[]
}

const ToolPicker: FC<Props> = ({
  disabled,
  trigger,
  placement = 'right-start',
  offset = 0,
  isShow,
  onShowChange,
  onSelect,
  supportAddCustomTool,
  scope = 'all',
  selectedTools,
  panelClassName,
}) => {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const { data: buildInTools } = useAllBuiltInTools()
  const { data: customTools } = useAllCustomTools()
  const invalidateCustomTools = useInvalidateAllCustomTools()
  const { data: workflowTools } = useAllWorkflowTools()

  const { builtinToolList, customToolList, workflowToolList } = useMemo(() => {
    if (scope === 'plugins') {
      return {
        builtinToolList: buildInTools,
        customToolList: [],
        workflowToolList: [],
      }
    }
    if (scope === 'custom') {
      return {
        builtinToolList: [],
        customToolList: customTools,
        workflowToolList: [],
      }
    }
    if (scope === 'workflow') {
      return {
        builtinToolList: [],
        customToolList: [],
        workflowToolList: workflowTools,
      }
    }
    return {
      builtinToolList: buildInTools,
      customToolList: customTools,
      workflowToolList: workflowTools,
    }
  }, [scope, buildInTools, customTools, workflowTools])

  const handleAddedCustomTool = invalidateCustomTools

  const handleTriggerClick = () => {
    if (disabled) return
    onShowChange(true)
  }

  const handleSelect = (_type: BlockEnum, tool?: ToolDefaultValue) => {
    onSelect(tool!)
  }

  const [isShowEditCollectionToolModal, {
    setFalse: hideEditCustomCollectionModal,
    setTrue: showEditCustomCollectionModal,
  }] = useBoolean(false)

  return (
    <PortalToFollowElem
      placement={placement}
      offset={offset}
      open={isShow}
      onOpenChange={onShowChange}
    >
      <PortalToFollowElemTrigger
        onClick={handleTriggerClick}
      >
        {trigger}
      </PortalToFollowElemTrigger>

      <PortalToFollowElemContent className='z-[1000]'>
        <div className={cn('relative min-h-20 w-[356px] rounded-xl border-[0.5px] border-components-panel-border bg-components-panel-bg-blur shadow-lg backdrop-blur-sm', panelClassName)}>
          <AllTools
            className='mt-1'
            toolContentClassName='max-w-[360px]'
            tags={tags}
            searchText={searchText}
            onSelect={handleSelect}
            supportAddCustomTool={supportAddCustomTool}
            onAddedCustomTool={handleAddedCustomTool}
            onShowAddCustomCollectionModal={showEditCustomCollectionModal}
            selectedTools={selectedTools}
          />
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default React.memo(ToolPicker)

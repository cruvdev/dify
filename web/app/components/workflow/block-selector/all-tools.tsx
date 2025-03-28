import {
  useRef,
  useState,
} from 'react'
import type {
  OnSelectBlock,
} from '../types'
import type { ToolValue } from './types'
import { ToolTypeEnum } from './types'
import Tools from './tools'
import { useToolTabs } from './hooks'
import ViewTypeSelect, { ViewType } from './view-type-select'
import cn from '@/utils/classnames'
import ActionButton from '../../base/action-button'
import { RiAddLine } from '@remixicon/react'

type AllToolsProps = {
  className?: string
  toolContentClassName?: string
  searchText: string
  tags: string[]
  onSelect: OnSelectBlock
  supportAddCustomTool?: boolean
  onAddedCustomTool?: () => void
  onShowAddCustomCollectionModal?: () => void
  selectedTools?: ToolValue[]
}
const AllTools = ({
  className,
  toolContentClassName,
  searchText,
  tags = [],
  onSelect,
  supportAddCustomTool,
  onShowAddCustomCollectionModal,
  selectedTools,
}: AllToolsProps) => {
  const tabs = useToolTabs()
  const [activeTab, setActiveTab] = useState(ToolTypeEnum.All)
  const [activeView, setActiveView] = useState<ViewType>(ViewType.flat)

  const pluginRef = useRef(null)
  const wrapElemRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn(className)}>
      <div className='flex items-center justify-between border-b-[0.5px] border-divider-subtle bg-background-default-hover px-3 shadow-xs'>
        <div className='flex h-8 items-center space-x-1'>
          {
            tabs.map(tab => (
              <div
                className={cn(
                  'flex h-6 cursor-pointer items-center rounded-md px-2 hover:bg-state-base-hover',
                  'text-xs font-medium text-text-secondary',
                  activeTab === tab.key && 'bg-state-base-hover-alt',
                )}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.name}
              </div>
            ))
          }
        </div>
        <ViewTypeSelect viewType={activeView} onChange={setActiveView} />
        {supportAddCustomTool && (
          <div className='flex items-center'>
            <div className='mr-1.5 h-3.5 w-px  bg-divider-regular'></div>
            <ActionButton
              className='bg-components-button-primary-bg text-components-button-primary-text hover:bg-components-button-primary-bg hover:text-components-button-primary-text'
              onClick={onShowAddCustomCollectionModal}
            >
              <RiAddLine className='h-4 w-4' />
            </ActionButton>
          </div>
        )}
      </div>
      <div
        ref={wrapElemRef}
        className='max-h-[464px] overflow-y-auto'
        onScroll={(pluginRef.current as any)?.handleScroll}
      >
        <Tools
          className={toolContentClassName}
          showWorkflowEmpty={activeTab === ToolTypeEnum.Workflow}
          onSelect={onSelect}
          viewType={activeView}
          hasSearchText={!!searchText}
          selectedTools={selectedTools}
        />
      </div>
    </div>
  )
}

export default AllTools

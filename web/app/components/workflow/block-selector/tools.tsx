import {
  memo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { BlockEnum } from '../types'
import IndexBar from './index-bar'
import type { ToolDefaultValue, ToolValue } from './types'
import { ViewType } from './view-type-select'
import { useGetLanguage } from '@/context/i18n'
import classNames from '@/utils/classnames'

type ToolsProps = {
  showWorkflowEmpty: boolean
  onSelect: (type: BlockEnum, tool?: ToolDefaultValue) => void
  viewType: ViewType
  hasSearchText: boolean
  className?: string
  indexBarClassName?: string
  selectedTools?: ToolValue[]
}
const Blocks = ({
  showWorkflowEmpty,
  onSelect,
  viewType,
  hasSearchText,
  className,
  indexBarClassName,
  selectedTools,
}: ToolsProps) => {
  const { t } = useTranslation()
  const language = useGetLanguage()
  const isFlatView = viewType === ViewType.flat
  const isShowLetterIndex = isFlatView
  /*
  treeViewToolsData:
  {
    A: {
      'google': [ // plugin organize name
        ...tools
      ],
      'custom': [ // custom tools
        ...tools
      ],
      'workflow': [ // workflow as tools
        ...tools
      ]
    }
  }
  */

  const toolRefs = useRef({})

  return (
    <div className={classNames('p-1 max-w-[320px]', className)}>
      {isShowLetterIndex && <IndexBar letters={[]} itemRefs={toolRefs} className={indexBarClassName} />}
    </div>
  )
}

export default memo(Blocks)

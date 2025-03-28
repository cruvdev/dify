'use client'
import type { FC } from 'react'
import {
  memo,
  useCallback,
} from 'react'
import { useTranslation } from 'react-i18next'
import BlockSelector from '../../../../block-selector'
import type { Param } from '../../types'
import cn from '@/utils/classnames'
import type { ToolDefaultValue } from '@/app/components/workflow/block-selector/types'
import type { BlockEnum } from '@/app/components/workflow/types'
import { useLanguage } from '@/app/components/header/account-setting/model-provider-page/hooks'

const i18nPrefix = 'workflow.nodes.parameterExtractor'

type Props = {
  onImport: (params: Param[]) => void
}

function toParmExactParams(lan: string): Param[] {
  return []
}
const ImportFromTool: FC<Props> = ({
  onImport,
}) => {
  const { t } = useTranslation()
  const language = useLanguage()

  const handleSelectTool = useCallback((_type: BlockEnum, toolInfo?: ToolDefaultValue) => {
    const formattedParams = toParmExactParams(language)
    onImport(formattedParams)
  }, [language, onImport])

  const renderTrigger = useCallback((open: boolean) => {
    return (
      <div>
        <div className={cn(
          'flex h-6 cursor-pointer items-center rounded-md px-2 text-xs font-medium text-gray-500 hover:bg-gray-100',
          open && 'bg-gray-100',
        )}>
          {t(`${i18nPrefix}.importFromTool`)}
        </div>
      </div>
    )
  }, [t])

  return (
    <BlockSelector
      placement='bottom-end'
      offset={{
        mainAxis: 4,
        crossAxis: 52,
      }}
      trigger={renderTrigger}
      onSelect={handleSelectTool}
      noBlocks
    />
  )
}
export default memo(ImportFromTool)

'use client'

import Tooltip from '@/app/components/base/tooltip'
import type { ReactNode } from 'react'
import { type FC, useState } from 'react'
import { useBoolean } from 'ahooks'
import cn from '@/utils/classnames'

export type SwitchPluginVersionProps = {
  uniqueIdentifier: string
  tooltip?: ReactNode
  onChange?: (version: string) => void
  className?: string
}

export const SwitchPluginVersion: FC<SwitchPluginVersionProps> = (props) => {
  const { tooltip, className } = props
  const [isShow] = useState(false)
  const [isShowUpdateModal] = useBoolean(false)

  return <Tooltip popupContent={!isShow && !isShowUpdateModal && tooltip} triggerMethod='hover'>
    <div className={cn('flex w-fit items-center justify-center', className)} onClick={e => e.stopPropagation()}>
    </div>
  </Tooltip>
}

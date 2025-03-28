import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '@/app/components/workflow/blocks'
import type { NodeDefault } from '../../types'
import type { AgentNodeType } from './types'

const nodeDefault: NodeDefault<AgentNodeType> = {
  defaultValue: {
  },
  getAvailablePrevNodes(isChatMode) {
    return isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS
  },
  getAvailableNextNodes(isChatMode) {
    return isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS
  },
  checkValid(payload, t, moreDataForCheckValid: {
    language: string
    isReadyForCheckValid: boolean
  }) {
    const { isReadyForCheckValid } = moreDataForCheckValid
    if (!isReadyForCheckValid) {
      return {
        isValid: true,
        errorMessage: '',
      }
    }
    return {
      isValid: true,
      errorMessage: '',
    }
  },
}

export default nodeDefault

import { get } from './base'
import { useInvalid } from './use-base'
import {
  useQuery,
} from '@tanstack/react-query'

const NAME_SPACE = 'tools'

const useAllBuiltInToolsKey = [NAME_SPACE, 'builtIn']
export const useAllBuiltInTools = () => {
  return useQuery({
    queryKey: useAllBuiltInToolsKey,
    queryFn: () => get('/workspaces/current/tools/builtin'),
  })
}

export const useInvalidateAllBuiltInTools = () => {
  return useInvalid(useAllBuiltInToolsKey)
}

const useAllCustomToolsKey = [NAME_SPACE, 'customTools']
export const useAllCustomTools = () => {
  return useQuery({
    queryKey: useAllCustomToolsKey,
    queryFn: () => get('/workspaces/current/tools/api'),
  })
}

export const useInvalidateAllCustomTools = () => {
  return useInvalid(useAllCustomToolsKey)
}

const useAllWorkflowToolsKey = [NAME_SPACE, 'workflowTools']
export const useAllWorkflowTools = () => {
  return useQuery({
    queryKey: useAllWorkflowToolsKey,
    queryFn: () => get('/workspaces/current/tools/workflow'),
  })
}

import type {
  ModelProvider,
} from '@/app/components/header/account-setting/model-provider-page/declarations'
import { fetchModelProviderModelList } from '@/service/common'
import { get, post } from './base'
import type { MutateOptions } from '@tanstack/react-query'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useInvalidateAllBuiltInTools } from './use-tools'

const NAME_SPACE = 'plugins'

const useInstalledPluginListKey = [NAME_SPACE, 'installedPluginList']
export const useCheckInstalled = ({
  pluginIds,
  enabled,
}: {
  pluginIds: string[],
  enabled: boolean
}) => {
  return useQuery({
    queryKey: [NAME_SPACE, 'checkInstalled', pluginIds],
    queryFn: () => post('/workspaces/current/plugin/list/installations/ids', {
      body: {
        plugin_ids: pluginIds,
      },
    }),
    enabled,
    staleTime: 0, // always fresh
  })
}

export const useInstalledPluginList = (disable?: boolean) => {
  return useQuery({
    queryKey: useInstalledPluginListKey,
    queryFn: () => get('/workspaces/current/plugin/list'),
    enabled: !disable,
    initialData: !disable ? undefined : { plugins: [] },
  })
}

export const useInvalidateInstalledPluginList = () => {
  const queryClient = useQueryClient()
  const invalidateAllBuiltInTools = useInvalidateAllBuiltInTools()
  return () => {
    queryClient.invalidateQueries(
      {
        queryKey: useInstalledPluginListKey,
      })
    invalidateAllBuiltInTools()
  }
}

export const useInstallPackageFromMarketPlace = (options?: MutateOptions<unknown, Error, string>) => {
  return useMutation({
    ...options,
    mutationFn: (uniqueIdentifier: string) => {
      return post('/workspaces/current/plugin/install/marketplace', { body: { plugin_unique_identifiers: [uniqueIdentifier] } })
    },
  })
}

export const useModelInList = (currentProvider?: ModelProvider, modelId?: string) => {
  return useQuery({
    queryKey: ['modelInList', currentProvider?.provider, modelId],
    queryFn: async () => {
      if (!modelId || !currentProvider) return false
      try {
        const modelsData = await fetchModelProviderModelList(`/workspaces/current/model-providers/${currentProvider?.provider}/models`)
        return !!modelId && !!modelsData.data.find(item => item.model === modelId)
      }
      catch (error) {
        return false
      }
    },
    enabled: !!modelId && !!currentProvider,
  })
}

export const usePluginInfo = (providerName?: string) => {
  return useQuery({
    queryKey: ['pluginInfo', providerName],
    enabled: !!providerName,
  })
}

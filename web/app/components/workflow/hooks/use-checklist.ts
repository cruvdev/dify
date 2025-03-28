import {
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useStoreApi } from 'reactflow'
import type {
  CommonNodeType,
  Edge,
  Node,
} from '../types'
import { BlockEnum } from '../types'
import { getValidTreeNodes } from '../utils'
import {
  CUSTOM_NODE,
  MAX_TREE_DEPTH,
} from '../constants'
import { useIsChatMode } from './use-workflow'
import { useNodesExtraData } from './use-nodes-data'
import { useToastContext } from '@/app/components/base/toast'
import { useGetLanguage } from '@/context/i18n'
import { useDatasetsDetailStore } from '../datasets-detail-store/store'
import type { KnowledgeRetrievalNodeType } from '../nodes/knowledge-retrieval/types'
import type { DataSet } from '@/models/datasets'
import { fetchDatasets } from '@/service/datasets'

export const useChecklist = (nodes: Node[], edges: Edge[]) => {
  const { t } = useTranslation()
  const language = useGetLanguage()
  const nodesExtraData = useNodesExtraData()
  const isChatMode = useIsChatMode()
  const datasetsDetail = useDatasetsDetailStore(s => s.datasetsDetail)

  const getCheckData = useCallback((data: CommonNodeType<{}>) => {
    let checkData = data
    if (data.type === BlockEnum.KnowledgeRetrieval) {
      const datasetIds = (data as CommonNodeType<KnowledgeRetrievalNodeType>).dataset_ids
      const _datasets = datasetIds.reduce<DataSet[]>((acc, id) => {
        if (datasetsDetail[id])
          acc.push(datasetsDetail[id])
        return acc
      }, [])
      checkData = {
        ...data,
        _datasets,
      } as CommonNodeType<KnowledgeRetrievalNodeType>
    }
    return checkData
  }, [datasetsDetail])

  const needWarningNodes = useMemo(() => {
    const list = []
    const { validNodes } = getValidTreeNodes(nodes.filter(node => node.type === CUSTOM_NODE), edges)

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      let toolIcon
      let moreDataForCheckValid

      if (node.data.type === BlockEnum.Agent)
        moreDataForCheckValid = { language }

      if (node.type === CUSTOM_NODE) {
        const checkData = getCheckData(node.data)
        const { errorMessage } = nodesExtraData[node.data.type]?.checkValid(checkData, t, moreDataForCheckValid) || {}

        if (errorMessage || !validNodes.find(n => n.id === node.id)) {
          list.push({
            id: node.id,
            type: node.data.type,
            title: node.data.title,
            toolIcon,
            unConnected: !validNodes.find(n => n.id === node.id),
            errorMessage,
          })
        }
      }
    }

    if (isChatMode && !nodes.find(node => node.data.type === BlockEnum.Answer)) {
      list.push({
        id: 'answer-need-added',
        type: BlockEnum.Answer,
        title: t('workflow.blocks.answer'),
        errorMessage: t('workflow.common.needAnswerNode'),
      })
    }

    if (!isChatMode && !nodes.find(node => node.data.type === BlockEnum.End)) {
      list.push({
        id: 'end-need-added',
        type: BlockEnum.End,
        title: t('workflow.blocks.end'),
        errorMessage: t('workflow.common.needEndNode'),
      })
    }

    return list
  }, [nodes, edges, isChatMode, language, nodesExtraData, t, getCheckData])

  return needWarningNodes
}

export const useChecklistBeforePublish = () => {
  const { t } = useTranslation()
  const language = useGetLanguage()
  const { notify } = useToastContext()
  const isChatMode = useIsChatMode()
  const store = useStoreApi()
  const nodesExtraData = useNodesExtraData()
  const updateDatasetsDetail = useDatasetsDetailStore(s => s.updateDatasetsDetail)
  const updateTime = useRef(0)

  const getCheckData = useCallback((data: CommonNodeType<{}>, datasets: DataSet[]) => {
    let checkData = data
    if (data.type === BlockEnum.KnowledgeRetrieval) {
      const datasetIds = (data as CommonNodeType<KnowledgeRetrievalNodeType>).dataset_ids
      const datasetsDetail = datasets.reduce<Record<string, DataSet>>((acc, dataset) => {
        acc[dataset.id] = dataset
        return acc
      }, {})
      const _datasets = datasetIds.reduce<DataSet[]>((acc, id) => {
        if (datasetsDetail[id])
          acc.push(datasetsDetail[id])
        return acc
      }, [])
      checkData = {
        ...data,
        _datasets,
      } as CommonNodeType<KnowledgeRetrievalNodeType>
    }
    return checkData
  }, [])

  const handleCheckBeforePublish = useCallback(async () => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes().filter(node => node.type === CUSTOM_NODE)
    const {
      validNodes,
      maxDepth,
    } = getValidTreeNodes(nodes.filter(node => node.type === CUSTOM_NODE), edges)

    if (maxDepth > MAX_TREE_DEPTH) {
      notify({ type: 'error', message: t('workflow.common.maxTreeDepth', { depth: MAX_TREE_DEPTH }) })
      return false
    }
    // Before publish, we need to fetch datasets detail, in case of the settings of datasets have been changed
    const knowledgeRetrievalNodes = nodes.filter(node => node.data.type === BlockEnum.KnowledgeRetrieval)
    const allDatasetIds = knowledgeRetrievalNodes.reduce<string[]>((acc, node) => {
      return Array.from(new Set([...acc, ...(node.data as CommonNodeType<KnowledgeRetrievalNodeType>).dataset_ids]))
    }, [])
    let datasets: DataSet[] = []
    if (allDatasetIds.length > 0) {
      updateTime.current = updateTime.current + 1
      const currUpdateTime = updateTime.current
      const { data: datasetsDetail } = await fetchDatasets({ url: '/datasets', params: { page: 1, ids: allDatasetIds } })
      if (datasetsDetail && datasetsDetail.length > 0) {
        // avoid old data to overwrite the new data
        if (currUpdateTime < updateTime.current)
          return false
        datasets = datasetsDetail
        updateDatasetsDetail(datasetsDetail)
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      let moreDataForCheckValid

      if (node.data.type === BlockEnum.Agent)
        moreDataForCheckValid = { language }

      const checkData = getCheckData(node.data, datasets)
      console.log('useChecklistBeforePublish checkData:', checkData)
      const { errorMessage } = nodesExtraData[node.data.type as BlockEnum].checkValid(checkData, t, moreDataForCheckValid)
      console.log('useChecklistBeforePublish errorMessage:', errorMessage)

      if (errorMessage) {
        notify({ type: 'error', message: `[${node.data.title}] ${errorMessage}` })
        return false
      }

      if (!validNodes.find(n => n.id === node.id)) {
        notify({ type: 'error', message: `[${node.data.title}] ${t('workflow.common.needConnectTip')}` })
        return false
      }
    }

    if (isChatMode && !nodes.find(node => node.data.type === BlockEnum.Answer)) {
      notify({ type: 'error', message: t('workflow.common.needAnswerNode') })
      return false
    }

    if (!isChatMode && !nodes.find(node => node.data.type === BlockEnum.End)) {
      notify({ type: 'error', message: t('workflow.common.needEndNode') })
      return false
    }

    return true
  }, [store, isChatMode, notify, t, language, nodesExtraData, updateDatasetsDetail, getCheckData])

  return {
    handleCheckBeforePublish,
  }
}

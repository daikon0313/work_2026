import type { DFDData } from '../types/sql'

const API_BASE_URL = 'http://localhost:8000'

interface ParseAPIRequest {
  sql: string
  separate_logic_nodes: boolean
}

interface ParseAPIResponse {
  nodes: Array<{
    id: string
    type: 'table' | 'logic'
    label: string
    columns?: string[]
    logicType?: 'where' | 'join' | 'groupby'
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    label?: string
  }>
}

/**
 * SQLをパースしてDFDデータを取得（API呼び出し）
 */
export async function parseSQLToAPI(
  sql: string,
  separateLogicNodes: boolean = true
): Promise<DFDData> {
  const request: ParseAPIRequest = {
    sql,
    separate_logic_nodes: separateLogicNodes
  }

  const response = await fetch(`${API_BASE_URL}/api/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  const data: ParseAPIResponse = await response.json()

  return {
    nodes: data.nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      columns: node.columns,
      logicType: node.logicType
    })),
    edges: data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    }))
  }
}

/**
 * APIのヘルスチェック
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react'
import type { Connection, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import TableNode from './TableNode'
import LogicNode from './LogicNode'
import type { DFDData } from '../types/sql'
import './DFDViewer.css'

interface DFDViewerProps {
  data: DFDData
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  table: TableNode,
  logic: LogicNode,
}

// ノードの位置を自動計算（フローグループ方式 - 線の交差を最小化）
function calculateLayout(dfdData: DFDData): { nodes: Node[]; edges: Edge[] } {
  const { nodes: dfdNodes, edges: dfdEdges } = dfdData

  if (dfdNodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // エッジから依存関係を構築
  const incomingEdges = new Map<string, string[]>()
  const outgoingEdges = new Map<string, string[]>()

  for (const edge of dfdEdges) {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, [])
    }
    incomingEdges.get(edge.target)!.push(edge.source)

    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, [])
    }
    outgoingEdges.get(edge.source)!.push(edge.target)
  }

  // レベル（階層）を計算
  const levels = new Map<string, number>()

  function calculateLevel(nodeId: string, visited = new Set<string>()): number {
    if (levels.has(nodeId)) return levels.get(nodeId)!
    if (visited.has(nodeId)) return 0

    visited.add(nodeId)
    const deps = incomingEdges.get(nodeId) || []
    if (deps.length === 0) {
      levels.set(nodeId, 0)
      return 0
    }

    const maxDepLevel = Math.max(...deps.map(d => calculateLevel(d, visited)))
    const level = maxDepLevel + 1
    levels.set(nodeId, level)
    return level
  }

  for (const node of dfdNodes) {
    calculateLevel(node.id)
  }

  const maxLevel = Math.max(...Array.from(levels.values()), 0)

  // 固定の間隔
  const xSpacing = 350
  const ySpacing = 180

  const nodePositions = new Map<string, { x: number; y: number }>()

  // Step 1: 各ソースノードから「メインパス」を追跡
  // メインパス = ソースから合流点まで単一の子を持つノードのチェーン
  const sourceNodes = dfdNodes
    .filter(n => (levels.get(n.id) || 0) === 0)
    .sort((a, b) => a.label.localeCompare(b.label))

  // 各ノードの「フローID」を決定（どのソースから派生しているか）
  const nodeFlowId = new Map<string, string>()

  // 各ソースからDFSでフローを追跡
  function traceFlow(sourceId: string) {
    const stack = [sourceId]
    while (stack.length > 0) {
      const nodeId = stack.pop()!
      if (nodeFlowId.has(nodeId)) continue

      const parents = incomingEdges.get(nodeId) || []

      // 親が1つだけの場合、または親がいない場合（ソース）、フローIDを設定
      if (parents.length <= 1) {
        nodeFlowId.set(nodeId, sourceId)
      }

      // 子を追跡
      const children = outgoingEdges.get(nodeId) || []
      for (const child of children) {
        const childParents = incomingEdges.get(child) || []
        // 子の親がこのノードだけの場合、同じフローとして追跡
        if (childParents.length === 1) {
          stack.push(child)
        }
      }
    }
  }

  for (const source of sourceNodes) {
    traceFlow(source.id)
  }

  // Step 2: JOINやUNIONで合流するフローをグループ化
  // 各合流点で、どのフローが合流するかを記録
  const mergePoints = new Map<string, string[]>() // nodeId -> [flowId, ...]

  for (const node of dfdNodes) {
    const parents = incomingEdges.get(node.id) || []
    if (parents.length > 1) {
      const flowIds = parents.map(p => nodeFlowId.get(p)).filter(Boolean) as string[]
      const uniqueFlowIds = [...new Set(flowIds)]
      if (uniqueFlowIds.length > 1) {
        mergePoints.set(node.id, uniqueFlowIds)
      }
    }
  }

  // Step 3: フローをグループ化（同じ合流点を持つフローを隣接させる）
  const flowGroups: string[][] = []
  const assignedFlows = new Set<string>()

  // 合流点ごとにグループを作成
  for (const [, flowIds] of mergePoints) {
    const unassigned = flowIds.filter(f => !assignedFlows.has(f))
    if (unassigned.length > 0) {
      flowGroups.push(unassigned)
      for (const f of unassigned) {
        assignedFlows.add(f)
      }
    }
  }

  // 残りのフローを個別グループとして追加
  for (const source of sourceNodes) {
    if (!assignedFlows.has(source.id)) {
      flowGroups.push([source.id])
      assignedFlows.add(source.id)
    }
  }

  // Step 4: 各フローにY位置（レーン）を割り当て
  const flowToLane = new Map<string, number>()
  let currentLane = 0

  for (const group of flowGroups) {
    // グループ内のフローをソート
    group.sort((a, b) => {
      const nodeA = dfdNodes.find(n => n.id === a)
      const nodeB = dfdNodes.find(n => n.id === b)
      return (nodeA?.label || '').localeCompare(nodeB?.label || '')
    })

    for (const flowId of group) {
      flowToLane.set(flowId, currentLane)
      currentLane++
    }
  }

  // Step 5: 各ノードのY位置を計算
  // 基本原則: 同じフローのノードは同じY位置（水平線）
  // 合流点は親フローの中央

  for (let level = 0; level <= maxLevel; level++) {
    const levelNodes = dfdNodes.filter(n => (levels.get(n.id) || 0) === level)

    // 各ノードのターゲットY位置を計算
    const nodeTargetY = new Map<string, number>()

    for (const node of levelNodes) {
      const parents = incomingEdges.get(node.id) || []
      let targetY: number

      if (parents.length === 0) {
        // ソースノード: フローのレーンに基づく
        const lane = flowToLane.get(node.id) ?? 0
        targetY = lane * ySpacing
      } else if (parents.length === 1) {
        // 単一の親: 親と同じY位置（水平線を維持）
        const parentPos = nodePositions.get(parents[0])
        if (parentPos) {
          targetY = parentPos.y
        } else {
          const flowId = nodeFlowId.get(node.id)
          const lane = flowId ? flowToLane.get(flowId) ?? 0 : 0
          targetY = lane * ySpacing
        }
      } else {
        // 複数の親（合流点）: 親のY位置の中央
        const parentYs = parents
          .map(p => nodePositions.get(p)?.y)
          .filter((y): y is number => y !== undefined)

        if (parentYs.length > 0) {
          const minY = Math.min(...parentYs)
          const maxY = Math.max(...parentYs)
          targetY = (minY + maxY) / 2
        } else {
          targetY = 0
        }
      }

      nodeTargetY.set(node.id, targetY)
    }

    // ターゲットY位置でソート
    levelNodes.sort((a, b) => {
      const yA = nodeTargetY.get(a.id) ?? 0
      const yB = nodeTargetY.get(b.id) ?? 0
      return yA - yB
    })

    // 衝突を解決
    const minGap = ySpacing * 0.9
    const finalPositions: Array<{ nodeId: string; y: number }> = []

    for (const node of levelNodes) {
      let y = nodeTargetY.get(node.id) ?? 0

      // 前のノードとの間隔を確保
      if (finalPositions.length > 0) {
        const lastY = finalPositions[finalPositions.length - 1].y
        if (y - lastY < minGap) {
          y = lastY + minGap
        }
      }

      finalPositions.push({ nodeId: node.id, y })
    }

    // 位置を設定
    for (const { nodeId, y } of finalPositions) {
      nodePositions.set(nodeId, { x: level * xSpacing, y })
    }
  }

  // Step 6: 全体を上端が0になるように調整
  let minY = Infinity
  for (const pos of nodePositions.values()) {
    minY = Math.min(minY, pos.y)
  }

  for (const [nodeId, pos] of nodePositions) {
    nodePositions.set(nodeId, { x: pos.x, y: pos.y - minY })
  }

  // ノードを生成
  const nodes: Node[] = dfdNodes.map(node => {
    const pos = nodePositions.get(node.id) || { x: 0, y: 0 }
    const level = levels.get(node.id) || 0

    return {
      id: node.id,
      type: node.type,
      position: pos,
      data: {
        label: node.label,
        columns: node.columns,
        logicType: node.logicType,
        isSource: level === 0,
        isOutput: level === maxLevel && node.label === 'OUTPUT',
      },
    }
  })

  // エッジを変換
  // 複数の入力を持つノードへの接続は直角、それ以外は直線
  const edges: Edge[] = dfdEdges.map(edge => {
    const targetParents = incomingEdges.get(edge.target) || []
    const edgeType = targetParents.length > 1 ? 'smoothstep' : 'straight'

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: edgeType,
      animated: false,
      style: { stroke: '#666', strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: '#888' },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    }
  })

  return { nodes, edges }
}

export default function DFDViewer({ data }: DFDViewerProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => calculateLayout(data),
    [data]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // dataが変更されたら再レイアウト
  useMemo(() => {
    const { nodes: newNodes, edges: newEdges } = calculateLayout(data)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [data, setNodes, setEdges])

  return (
    <div className="dfd-viewer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

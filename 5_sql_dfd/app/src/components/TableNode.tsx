import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import './TableNode.css'

interface TableNodeData {
  label: string
  columns?: string[]
  isSource?: boolean
  isOutput?: boolean
}

interface TableNodeProps {
  data: TableNodeData
}

function TableNode({ data }: TableNodeProps) {
  const { label, columns = [], isSource = false, isOutput = false } = data

  // ノードタイプに応じたクラス名を決定
  const nodeClass = isSource ? 'table-node source-node' :
                    isOutput ? 'table-node output-node' :
                    'table-node cte-node'

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Left} />
      <div className="table-header">{label}</div>
      {columns.length > 0 && (
        <div className="table-columns">
          {columns.map((col, index) => (
            <div
              key={index}
              className={`table-column ${col.startsWith('---') ? 'column-separator' : ''}`}
            >
              {col}
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default memo(TableNode)

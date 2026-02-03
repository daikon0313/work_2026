import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import './LogicNode.css'

interface LogicNodeData {
  label: string
  logicType?: 'where' | 'join' | 'groupby' | 'union'
}

interface LogicNodeProps {
  data: LogicNodeData
}

function LogicNode({ data }: LogicNodeProps) {
  const { label, logicType = 'join' } = data

  return (
    <div className={`logic-node logic-${logicType}`}>
      <Handle type="target" position={Position.Left} />
      <div className="logic-label">{label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default memo(LogicNode)

// SQLパーサーで使用する型定義

export interface Column {
  name: string
  alias?: string
  sourceTable?: string
}

export interface Table {
  name: string
  alias?: string
  columns: Column[]
  isRef: boolean // dbtのref()で参照されているか
}

export interface JoinCondition {
  leftTable: string
  leftColumn: string
  rightTable: string
  rightColumn: string
  joinType: 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER' | 'CROSS'
}

export interface WhereCondition {
  table: string
  column: string
  operator: string
  value: string
}

export interface GroupByClause {
  table: string
  columns: string[]
}

export interface CTE {
  name: string
  sourceTable?: Table
  columns: Column[]
  joins: JoinCondition[]
  whereConditions: WhereCondition[]
  groupBy?: GroupByClause
}

export interface ParsedSQL {
  ctes: CTE[]
  finalSelect?: CTE
}

// DFD描画用の型定義
export interface DFDNode {
  id: string
  type: 'table' | 'logic'
  label: string
  columns?: string[]
  logicType?: 'where' | 'join' | 'groupby' | 'case'
}

export interface DFDEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface DFDData {
  nodes: DFDNode[]
  edges: DFDEdge[]
}

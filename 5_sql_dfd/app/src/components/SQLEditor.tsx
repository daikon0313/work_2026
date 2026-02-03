import { useCallback } from 'react'
import './SQLEditor.css'

interface SQLEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function SQLEditor({ value, onChange }: SQLEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <div className="sql-editor">
      <div className="sql-editor-header">
        <h3>SQL Editor</h3>
        <span className="sql-editor-hint">dbt SQL (with CTE) を入力してください</span>
      </div>
      <textarea
        className="sql-editor-textarea"
        value={value}
        onChange={handleChange}
        placeholder={`-- SQLを入力してください
-- 例:
with table1 as (
    select * from {{ ref('SOURCE_TABLE') }}
    where column1 = 'value'
),
table2 as (
    select * from table1
    left join other_table on table1.id = other_table.id
)
select * from table2`}
        spellCheck={false}
      />
    </div>
  )
}

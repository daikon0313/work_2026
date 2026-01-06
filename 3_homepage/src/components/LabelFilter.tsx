import type { ArticleLabel } from '../types/article'
import './LabelFilter.css'

interface LabelFilterProps {
  selectedLabel: ArticleLabel | null
  onSelectLabel: (label: ArticleLabel | null) => void
}

const labels: ArticleLabel[] = ['Snowflake', 'Databricks', 'モデリング', 'dbt', 'Terraform', '日記', 'その他']

function LabelFilter({ selectedLabel, onSelectLabel }: LabelFilterProps) {
  return (
    <div className="label-filter">
      <button
        className={`label-btn ${selectedLabel === null ? 'active' : ''}`}
        onClick={() => onSelectLabel(null)}
      >
        すべて
      </button>
      {labels.map((label) => (
        <button
          key={label}
          className={`label-btn ${selectedLabel === label ? 'active' : ''}`}
          onClick={() => onSelectLabel(label)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default LabelFilter

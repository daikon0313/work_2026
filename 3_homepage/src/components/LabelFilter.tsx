import type { ArticleLabel } from '../types/article'
import { ARTICLE_LABELS } from '../types/article'
import './LabelFilter.css'

interface LabelFilterProps {
  selectedLabel: ArticleLabel | null
  onSelectLabel: (label: ArticleLabel | null) => void
}

function LabelFilter({ selectedLabel, onSelectLabel }: LabelFilterProps) {
  return (
    <div className="label-filter">
      <button
        className={`label-btn ${selectedLabel === null ? 'active' : ''}`}
        onClick={() => onSelectLabel(null)}
      >
        すべて
      </button>
      {ARTICLE_LABELS.map((label) => (
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

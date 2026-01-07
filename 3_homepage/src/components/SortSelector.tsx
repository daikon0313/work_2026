import './SortSelector.css'

export type SortOption = 'newest' | 'oldest'

interface SortSelectorProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <div className="sort-selector">
      <label htmlFor="sort" className="sort-label">
        並び順:
      </label>
      <select
        id="sort"
        className="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
      >
        <option value="newest">新しい順</option>
        <option value="oldest">古い順</option>
      </select>
    </div>
  )
}

export default SortSelector

import { useMemo } from 'react'
import type { ReadingCategory, ReadingIssue } from '../types/reading'
import { READING_CATEGORIES } from '../types/reading'
import './ReadingCategoryFilter.css'

interface ReadingCategoryFilterProps {
  selectedCategory: ReadingCategory | null
  onSelectCategory: (category: ReadingCategory | null) => void
  issues: ReadingIssue[]
}

function ReadingCategoryFilter({
  selectedCategory,
  onSelectCategory,
  issues
}: ReadingCategoryFilterProps) {
  // カテゴリごとのカウントを計算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    issues.forEach(issue => {
      const cat = issue.category || 'その他'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [issues])

  return (
    <div className="reading-category-filter">
      <button
        className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        すべて
        <span className="category-count">{issues.length}</span>
      </button>
      {READING_CATEGORIES.map((category) => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
          <span className="category-count">{categoryCounts[category] || 0}</span>
        </button>
      ))}
    </div>
  )
}

export default ReadingCategoryFilter

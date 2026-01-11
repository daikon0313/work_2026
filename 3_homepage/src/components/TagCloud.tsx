import type { ArticleLabel } from '../types/article'
import type { TagStatistics } from '../utils/tagUtils'
import { calculateTagFontSize } from '../utils/tagUtils'
import './TagCloud.css'

interface TagCloudProps {
  tags: TagStatistics[]
  selectedTag?: ArticleLabel | null
  onTagClick: (tag: ArticleLabel) => void
}

function TagCloud({ tags, selectedTag, onTagClick }: TagCloudProps) {
  if (tags.length === 0) {
    return null
  }

  const counts = tags.map((t) => t.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  return (
    <div className="tag-cloud">
      <h2 className="tag-cloud-title">🏷️ タグクラウド</h2>
      <div className="tag-cloud-container">
        {tags.map((tag) => {
          const fontSize = calculateTagFontSize(tag.count, minCount, maxCount)
          const isSelected = selectedTag === tag.label

          return (
            <button
              key={tag.label}
              className={`tag-cloud-item ${isSelected ? 'selected' : ''}`}
              style={{ fontSize: `${fontSize}rem` }}
              onClick={() => onTagClick(tag.label)}
              title={`${tag.label}: ${tag.count}記事 (${tag.percentage.toFixed(1)}%)`}
            >
              {tag.label}
              <span className="tag-cloud-count">{tag.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TagCloud

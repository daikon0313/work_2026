import { Link } from 'react-router-dom'
import type { Article } from '../types/article'
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime'
import './ArticleCard.css'

interface ArticleCardProps {
  article: Article
}

function ArticleCard({ article }: ArticleCardProps) {
  const readingTime = calculateReadingTime(article.content)

  return (
    <Link to={`/articles/${article.id}`} className="article-card-link">
      <div className="article-card">
        <div className="article-header">
          <h3 className="article-title">{article.title}</h3>
          <div className="article-meta">
            <span className="article-date">{article.createdAt}</span>
            <span className="article-reading-time">⏱️ {formatReadingTime(readingTime)}</span>
          </div>
        </div>
        <div className="article-labels">
          {article.labels.map((label) => (
            <span key={label} className="article-label">
              {label}
            </span>
          ))}
        </div>
        {article.excerpt && (
          <p className="article-excerpt">{article.excerpt}</p>
        )}
      </div>
    </Link>
  )
}

export default ArticleCard

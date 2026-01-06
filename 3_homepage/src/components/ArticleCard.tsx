import type { Article } from '../types/article'
import './ArticleCard.css'

interface ArticleCardProps {
  article: Article
  onClick: () => void
}

function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div className="article-card" onClick={onClick}>
      <div className="article-header">
        <h3 className="article-title">{article.title}</h3>
        <span className="article-date">{article.createdAt}</span>
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
  )
}

export default ArticleCard

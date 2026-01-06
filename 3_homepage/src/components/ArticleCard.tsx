import { Link } from 'react-router-dom'
import type { Article } from '../types/article'
import './ArticleCard.css'

interface ArticleCardProps {
  article: Article
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link to={`/articles/${article.id}`} className="article-card-link">
      <div className="article-card">
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
    </Link>
  )
}

export default ArticleCard

import type { Article } from '../types/article'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ArticleDetail.css'

interface ArticleDetailProps {
  article: Article
  onClose: () => void
}

function ArticleDetail({ article, onClose }: ArticleDetailProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <article className="article-detail">
          <header className="article-detail-header">
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span className="article-date">{article.createdAt}</span>
              <div className="article-labels">
                {article.labels.map((label) => (
                  <span key={label} className="article-label">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </header>
          <div className="article-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}

export default ArticleDetail

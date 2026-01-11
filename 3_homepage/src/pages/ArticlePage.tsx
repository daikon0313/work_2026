import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { articles } from '../article_data/articles'
import './ArticlePage.css'

function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const article = articles.find((a) => a.id === id)

  if (!article) {
    return (
      <div className="article-page-error">
        <h1>記事が見つかりません</h1>
        <p>指定された記事は存在しません。</p>
        <button onClick={() => navigate('/')}>ホームに戻る</button>
      </div>
    )
  }

  return (
    <main className="article-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← 記事一覧に戻る
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
          {article.discussionUrl && (
            <div className="article-discussion">
              <a
                href={article.discussionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="discussion-link"
              >
                💬 この記事についてディスカッションする
              </a>
            </div>
          )}
        </header>
        <div className="article-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}

export default ArticlePage

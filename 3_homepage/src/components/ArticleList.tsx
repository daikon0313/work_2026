import type { Article } from '../types/article'
import ArticleCard from './ArticleCard'
import './ArticleList.css'

interface ArticleListProps {
  articles: Article[]
  onArticleClick: (article: Article) => void
}

function ArticleList({ articles, onArticleClick }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="no-articles">
        <p>記事が見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onClick={() => onArticleClick(article)}
        />
      ))}
    </div>
  )
}

export default ArticleList

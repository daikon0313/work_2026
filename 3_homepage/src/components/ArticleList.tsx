import type { Article } from '../types/article'
import ArticleCard from './ArticleCard'
import './ArticleList.css'

interface ArticleListProps {
  articles: Article[]
}

function ArticleList({ articles }: ArticleListProps) {
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
        />
      ))}
    </div>
  )
}

export default ArticleList

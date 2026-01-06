import { useState, useMemo } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import LabelFilter from './components/LabelFilter'
import ArticleList from './components/ArticleList'
import ArticleDetail from './components/ArticleDetail'
import { articles } from './data/articles'
import type { Article, ArticleLabel } from './types/article'
import './styles/App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<ArticleLabel | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesLabel = selectedLabel === null || article.labels.includes(selectedLabel)

      return matchesSearch && matchesLabel
    })
  }, [searchQuery, selectedLabel])

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="search-section">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <LabelFilter selectedLabel={selectedLabel} onSelectLabel={setSelectedLabel} />
        </div>
        <ArticleList articles={filteredArticles} onArticleClick={setSelectedArticle} />
      </main>
      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  )
}

export default App

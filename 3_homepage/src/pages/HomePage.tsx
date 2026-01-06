import { useState, useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import LabelFilter from '../components/LabelFilter'
import ArticleList from '../components/ArticleList'
import { articles } from '../data/articles'
import type { ArticleLabel } from '../types/article'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<ArticleLabel | null>(null)

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
    <main className="main-content">
      <div className="search-section">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <LabelFilter selectedLabel={selectedLabel} onSelectLabel={setSelectedLabel} />
      </div>
      <ArticleList articles={filteredArticles} />
    </main>
  )
}

export default HomePage

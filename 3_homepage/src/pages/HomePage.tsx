import { useState, useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import LabelFilter from '../components/LabelFilter'
import SortSelector from '../components/SortSelector'
import ArticleList from '../components/ArticleList'
import { articles } from '../article_data/articles'
import type { ArticleLabel } from '../types/article'
import type { SortOption } from '../components/SortSelector'

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<ArticleLabel | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  const filteredAndSortedArticles = useMemo(() => {
    // フィルタリング
    const filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesLabel = selectedLabel === null || article.labels.includes(selectedLabel)

      return matchesSearch && matchesLabel
    })

    // ソート
    return filtered.sort((a, b) => {
      if (sortOption === 'newest') {
        return b.createdAt.localeCompare(a.createdAt)
      } else {
        return a.createdAt.localeCompare(b.createdAt)
      }
    })
  }, [searchQuery, selectedLabel, sortOption])

  return (
    <main className="main-content">
      <div className="search-section">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="filter-sort-section">
          <LabelFilter selectedLabel={selectedLabel} onSelectLabel={setSelectedLabel} />
          <SortSelector value={sortOption} onChange={setSortOption} />
        </div>
      </div>
      <ArticleList articles={filteredAndSortedArticles} />
    </main>
  )
}

export default HomePage

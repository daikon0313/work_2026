import { useState } from 'react'
import './SearchBar.css'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onClear: () => void
}

function SearchBar({ searchQuery, onSearchChange, onClear }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
      <div className="search-bar-container">
        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>

        <input
          type="text"
          className="search-input"
          placeholder="記事を検索... (タイトル、タグ、内容)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {searchQuery && (
          <button
            className="search-clear"
            onClick={onClear}
            aria-label="検索をクリア"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="search-hint">
          検索中: "{searchQuery}"
        </div>
      )}
    </div>
  )
}

export default SearchBar

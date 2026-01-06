import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import ReadingListPage from './pages/ReadingListPage'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
      </Routes>
    </div>
  )
}

export default App

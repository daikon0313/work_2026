import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import ReadingListPage from './pages/ReadingListPage'
import StatsPage from './pages/StatsPage'
import DailyPage from './pages/DailyPage'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/reading-list" element={<ReadingListPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </div>
  )
}

export default App

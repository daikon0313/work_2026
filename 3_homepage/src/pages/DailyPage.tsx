import { useMemo } from 'react'
import { dailyEntries } from '../daily_data/entries'
import ReactMarkdown from 'react-markdown'
import './DailyPage.css'

function DailyPage() {
  // 日付の新しい順にソート
  const sortedEntries = useMemo(() => {
    return [...dailyEntries].sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  return (
    <div className="daily-page">
      <div className="daily-header">
        <h1>📔 日記</h1>
        <p className="daily-description">日々の記録</p>
      </div>

      <div className="daily-entries">
        {sortedEntries.map((entry) => (
          <div key={entry.id} className="daily-entry">
            <div className="daily-content">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {sortedEntries.length === 0 && (
          <div className="daily-empty">
            <p>📝 まだ日記がありません</p>
            <p>新しい日記を追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DailyPage

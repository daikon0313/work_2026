import { useReadingList } from '../hooks/useReadingList'
import AddReadingForm from '../components/AddReadingForm'
import ReadingCard from '../components/ReadingCard'
import './ReadingListPage.css'

function ReadingListPage() {
  const {
    toReadItems,
    readItems,
    addItem,
    markAsRead,
    markAsUnread,
    deleteItem,
  } = useReadingList()

  return (
    <div className="reading-list-page">
      <div className="reading-list-container">
        <h1 className="page-title">読書リスト</h1>
        <p className="page-description">
          後で読みたい記事やブログを保存して、読んだら感想を記録しましょう
        </p>

        <AddReadingForm onAdd={addItem} />

        <section className="reading-section">
          <h2 className="section-title">
            後で読む <span className="count">({toReadItems.length})</span>
          </h2>
          {toReadItems.length === 0 ? (
            <p className="empty-message">まだ記事が追加されていません</p>
          ) : (
            <div className="reading-grid">
              {toReadItems.map((item) => (
                <ReadingCard
                  key={item.id}
                  item={item}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </section>

        <section className="reading-section">
          <h2 className="section-title">
            読了 <span className="count">({readItems.length})</span>
          </h2>
          {readItems.length === 0 ? (
            <p className="empty-message">まだ読了した記事がありません</p>
          ) : (
            <div className="reading-grid">
              {readItems.map((item) => (
                <ReadingCard
                  key={item.id}
                  item={item}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ReadingListPage

import { useState, useEffect } from 'react'
import type { ReadingItem, ReadingStatus } from '../types/reading'

const STORAGE_KEY = 'reading-list'

export function useReadingList() {
  const [items, setItems] = useState<ReadingItem[]>([])

  // localStorageから読み込み
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse reading list:', error)
      }
    }
  }, [])

  // localStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // 新しい読書アイテムを追加
  const addItem = (title: string, reason: string) => {
    const newItem: ReadingItem = {
      id: Date.now().toString(),
      title,
      status: 'to-read',
      reason,
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => [newItem, ...prev])
  }

  // ステータスを変更（未読→既読）
  const markAsRead = (id: string, impression: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'read' as ReadingStatus,
              impression,
              readAt: new Date().toISOString(),
            }
          : item
      )
    )
  }

  // ステータスを変更（既読→未読）
  const markAsUnread = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'to-read' as ReadingStatus,
              impression: undefined,
              readAt: undefined,
            }
          : item
      )
    )
  }

  // アイテムを削除
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  // 未読と既読に分類
  const toReadItems = items.filter((item) => item.status === 'to-read')
  const readItems = items.filter((item) => item.status === 'read')

  return {
    items,
    toReadItems,
    readItems,
    addItem,
    markAsRead,
    markAsUnread,
    deleteItem,
  }
}

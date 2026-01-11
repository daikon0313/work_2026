import { useState, useEffect } from 'react'
import type { ReadingIssue, CreateReadingIssueInput, MarkAsReadInput, DeleteReadingIssueInput, AddCommentInput } from '../types/reading'
import {
  fetchReadingIssues,
  createReadingIssue,
  markIssueAsRead,
  reopenIssue,
  fetchIssueComments,
  deleteReadingIssue,
  addCommentToIssue
} from '../utils/githubApi'

export function useReadingIssues() {
  const [issues, setIssues] = useState<ReadingIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Issueを取得
  const loadIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchReadingIssues()

      // 各Issueの感想をコメントから取得
      const issuesWithImpressions = await Promise.all(
        data.map(async (issue) => {
          if (issue.state === 'closed') {
            const impression = await fetchIssueComments(issue.number)
            return { ...issue, impression: impression || undefined }
          }
          return issue
        })
      )

      setIssues(issuesWithImpressions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 初回ロード
  useEffect(() => {
    loadIssues()
  }, [])

  // 新しい記事を追加
  const addIssue = async (input: CreateReadingIssueInput) => {
    try {
      setError(null)
      const newIssue = await createReadingIssue(input)
      setIssues((prev) => [newIssue, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue')
      throw err
    }
  }

  // 既読にする
  const markAsRead = async (input: MarkAsReadInput) => {
    try {
      setError(null)
      await markIssueAsRead(input)
      // Issueを再取得して状態を更新
      await loadIssues()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
      throw err
    }
  }

  // 未読に戻す
  const markAsUnread = async (issueNumber: number) => {
    try {
      setError(null)
      await reopenIssue(issueNumber)
      // Issueを再取得して状態を更新
      await loadIssues()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reopen issue')
      throw err
    }
  }

  // 削除
  const deleteIssue = async (input: DeleteReadingIssueInput) => {
    try {
      setError(null)
      await deleteReadingIssue(input)
      // Issueを再取得して状態を更新
      await loadIssues()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete issue')
      throw err
    }
  }

  // コメントを追加
  const addComment = async (input: AddCommentInput) => {
    try {
      setError(null)
      await addCommentToIssue(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
      throw err
    }
  }

  // 未読と既読に分類
  const toReadIssues = issues.filter((issue) => issue.state === 'open')
  const readIssues = issues.filter((issue) => issue.state === 'closed')

  return {
    issues,
    toReadIssues,
    readIssues,
    loading,
    error,
    addIssue,
    markAsRead,
    markAsUnread,
    deleteIssue,
    addComment,
    reload: loadIssues,
  }
}

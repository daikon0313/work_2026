import { GITHUB_CONFIG, getGitHubToken } from '../config/github'
import type { ReadingIssue, CreateReadingIssueInput, MarkAsReadInput } from '../types/reading'

const API_BASE = 'https://api.github.com'

// GitHub APIリクエストのヘッダー
function getHeaders(): HeadersInit {
  const token = getGitHubToken()
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}

// Issueボディのパース
function parseIssueBody(body: string | null): { url: string; reason: string } {
  if (!body) return { url: '', reason: '' }

  const urlMatch = body.match(/URL:\s*(.+)/)
  const reasonMatch = body.match(/読みたい理由:\s*([\s\S]+)/)

  return {
    url: urlMatch ? urlMatch[1].trim() : '',
    reason: reasonMatch ? reasonMatch[1].trim() : '',
  }
}

// GitHub Issueを読書リストアイテムに変換
function transformIssueToReadingItem(issue: any): ReadingIssue {
  const { url, reason } = parseIssueBody(issue.body)

  // タイトルから「[読みたい記事] 」プレフィックスを除去
  const title = issue.title.replace(/^\[読みたい記事\]\s*/, '')

  return {
    number: issue.number,
    title,
    url: issue.html_url,
    articleUrl: url,
    reason,
    state: issue.state,
    createdAt: issue.created_at,
    closedAt: issue.closed_at,
  }
}

// 読書リスト（Issues）を取得
export async function fetchReadingIssues(): Promise<ReadingIssue[]> {
  try {
    const url = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues?labels=${encodeURIComponent(GITHUB_CONFIG.label)}&state=all&per_page=100`

    const response = await fetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const issues = await response.json()
    return issues.map(transformIssueToReadingItem)
  } catch (error) {
    console.error('Failed to fetch reading issues:', error)
    throw error
  }
}

// 新しい読みたい記事を追加（Issue作成）
export async function createReadingIssue(input: CreateReadingIssueInput): Promise<ReadingIssue> {
  const token = getGitHubToken()
  if (!token) {
    throw new Error('GitHub token is required to create issues')
  }

  try {
    const url = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`

    const body = `URL: ${input.url}

読みたい理由: ${input.reason}`

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: `[読みたい記事] ${input.title}`,
        body,
        labels: [GITHUB_CONFIG.label],
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create issue: ${response.statusText}`)
    }

    const issue = await response.json()
    return transformIssueToReadingItem(issue)
  } catch (error) {
    console.error('Failed to create reading issue:', error)
    throw error
  }
}

// 記事を読了にする（Issueをクローズ + コメント追加）
export async function markIssueAsRead(input: MarkAsReadInput): Promise<void> {
  const token = getGitHubToken()
  if (!token) {
    throw new Error('GitHub token is required to update issues')
  }

  try {
    // 1. コメントを追加
    const commentUrl = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${input.issueNumber}/comments`

    await fetch(commentUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        body: `読了しました！\n\n感想:\n${input.impression}`,
      }),
    })

    // 2. Issueをクローズ
    const issueUrl = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${input.issueNumber}`

    const response = await fetch(issueUrl, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        state: 'closed',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to close issue: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to mark issue as read:', error)
    throw error
  }
}

// Issueを再オープン（既読→未読）
export async function reopenIssue(issueNumber: number): Promise<void> {
  const token = getGitHubToken()
  if (!token) {
    throw new Error('GitHub token is required to update issues')
  }

  try {
    const issueUrl = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${issueNumber}`

    const response = await fetch(issueUrl, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        state: 'open',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to reopen issue: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Failed to reopen issue:', error)
    throw error
  }
}

// Issueのコメントを取得
export async function fetchIssueComments(issueNumber: number): Promise<string | null> {
  try {
    const url = `${API_BASE}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues/${issueNumber}/comments`

    const response = await fetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`)
    }

    const comments = await response.json()

    // 最後のコメントから感想を抽出
    if (comments.length > 0) {
      const lastComment = comments[comments.length - 1]
      const impressionMatch = lastComment.body.match(/感想:\s*([\s\S]+)/)
      return impressionMatch ? impressionMatch[1].trim() : null
    }

    return null
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return null
  }
}

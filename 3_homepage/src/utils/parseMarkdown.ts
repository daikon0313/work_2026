import type { Article, ArticleLabel } from '../types/article'

interface MarkdownFrontmatter {
  id: string
  title: string
  labels: ArticleLabel[]
  createdAt: string
  excerpt?: string
}

export function parseMarkdown(rawContent: string): Article {
  // フロントマターとコンテンツを分割
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = rawContent.match(frontmatterRegex)

  if (!match) {
    throw new Error('Invalid markdown format: frontmatter not found')
  }

  const [, frontmatterStr, content] = match

  // フロントマターをパース
  const frontmatter: Partial<MarkdownFrontmatter> = {}
  const lines = frontmatterStr.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.substring(0, colonIndex).trim()
    const value = line.substring(colonIndex + 1).trim()

    if (key === 'labels') {
      // 配列をパース: ["label1", "label2"]
      const labelsMatch = value.match(/\[(.*?)\]/)
      if (labelsMatch) {
        frontmatter.labels = labelsMatch[1]
          .split(',')
          .map((label) => label.trim().replace(/^"|"$/g, '')) as ArticleLabel[]
      }
    } else if (key === 'id' || key === 'title' || key === 'createdAt' || key === 'excerpt') {
      frontmatter[key] = value.replace(/^"|"$/g, '')
    }
  }

  // 必須フィールドのチェック
  if (!frontmatter.id || !frontmatter.title || !frontmatter.labels || !frontmatter.createdAt) {
    throw new Error('Missing required frontmatter fields')
  }

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    labels: frontmatter.labels,
    createdAt: frontmatter.createdAt,
    excerpt: frontmatter.excerpt,
    content: content.trim(),
  }
}

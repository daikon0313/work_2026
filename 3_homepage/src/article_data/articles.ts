import type { Article } from '../types/article'
import { parseMarkdown } from '../utils/parseMarkdown'

// マークダウンファイルを動的インポート
import article001 from './articles/databricks/001.md?raw'

// マークダウンファイルをパースして記事配列を作成
export const articles: Article[] = [
  parseMarkdown(article001),
]

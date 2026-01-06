import type { Article } from '../types/article'
import { parseMarkdown } from '../utils/parseMarkdown'

// マークダウンファイルを動的インポート
import article001 from './articles/001.md?raw'
import article002 from './articles/002.md?raw'
import article003 from './articles/003.md?raw'
import article004 from './articles/004.md?raw'

// マークダウンファイルをパースして記事配列を作成
export const articles: Article[] = [
  parseMarkdown(article001),
  parseMarkdown(article002),
  parseMarkdown(article003),
  parseMarkdown(article004),
]

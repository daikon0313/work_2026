import type { DailyEntry } from '../types/daily'

// 月別の日記ファイルをインポート
import { entries_2026_01 } from './2026/2026-01'

// 全ての月の日記を統合
export const dailyEntries: DailyEntry[] = [
  ...entries_2026_01,
  // 新しい月を追加する場合は、ここにインポートして追加してください
  // 例: ...entries_2026_02,
]

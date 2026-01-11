// 学習目標の型定義

export interface ReadingGoals {
  monthly: number  // 月間目標（記事数）
  yearly: number   // 年間目標（記事数）
}

export const DEFAULT_GOALS: ReadingGoals = {
  monthly: 10,
  yearly: 120,
}

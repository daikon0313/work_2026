/**
 * テキストの読了時間を計算
 * @param text - 計算対象のテキスト
 * @returns 読了時間（分）
 */
export function calculateReadingTime(text: string): number {
  // 日本語の場合、1分あたり約400-600文字読めると仮定
  const CHARS_PER_MINUTE = 500

  // Markdownの記号などを除去してテキストのみをカウント
  const plainText = text
    .replace(/```[\s\S]*?```/g, '') // コードブロック除去
    .replace(/`[^`]+`/g, '') // インラインコード除去
    .replace(/#{1,6}\s/g, '') // 見出し記号除去
    .replace(/[*_~`]/g, '') // マークダウン記号除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンク → テキストのみ

  const charCount = plainText.length
  const minutes = Math.ceil(charCount / CHARS_PER_MINUTE)

  return Math.max(1, minutes) // 最低1分
}

/**
 * 読了時間を表示用の文字列に変換
 * @param minutes - 読了時間（分）
 * @returns 表示用文字列
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes}分で読めます`
}

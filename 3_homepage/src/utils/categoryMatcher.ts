import type { ReadingCategory } from '../types/reading'

// カテゴリごとのキーワードマップ
const CATEGORY_KEYWORDS: Record<ReadingCategory, string[]> = {
  'IT': [
    // プログラミング言語
    'python', 'javascript', 'typescript', 'java', 'go', 'rust', 'ruby', 'php', 'c++', 'c#', 'kotlin', 'swift',
    // フレームワーク・ライブラリ
    'react', 'vue', 'angular', 'node', 'django', 'flask', 'spring', 'laravel', 'express', 'next', 'nuxt',
    // インフラ・クラウド
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'devops',
    // データ技術
    'snowflake', 'databricks', 'dbt', 'bigquery', 'redshift', 'spark', 'hadoop', 'airflow', 'kafka', 'etl',
    // 開発関連
    'エンジニア', 'プログラミング', 'コード', 'アルゴリズム', 'データ構造',
    'アーキテクチャ', 'デザインパターン', 'リファクタリング', '開発',
    // データ分野
    'データエンジニアリング', 'データ分析', 'データサイエンス', 'ai', 'ml', '機械学習', 'ディープラーニング',
    // AI・エージェント関連
    'agent', 'エージェント', 'llm', 'gpt', 'chatgpt', 'claude', 'gemini', 'copilot',
    // その他IT用語
    'sql', 'データベース', 'api', 'システム', 'ソフトウェア', 'web', 'アプリ', 'サーバー', 'フロントエンド', 'バックエンド',
    'セキュリティ', 'ネットワーク', 'クラウド', 'git', 'github', 'テスト', 'デバッグ'
  ],
  '経済': [
    '経済', '金融', '投資', '株', '市場', 'ビジネス', '企業', '経営', '会計', '財務',
    'gdp', 'インフレ', 'デフレ', '景気', '資本', '為替', '債券', '資産', '利益', '収益',
    'マーケット', '銀行', '証券', 'ファイナンス', '財政', '予算', '税金', '貿易', '株価',
    '投資信託', '配当', '金利', '不動産', 'リート', '暗号資産', '仮想通貨', 'ビットコイン',
    '経済学', 'マクロ経済', 'ミクロ経済', '経済政策', '中央銀行', '日銀', 'fed'
  ],
  '仕事': [
    '仕事', 'キャリア', '転職', '働き方', 'リモート', 'リモートワーク', 'テレワーク',
    'マネジメント', 'リーダーシップ', '組織', 'チーム', 'プロジェクト', '生産性', 'タスク管理', '時間管理',
    '会議', 'コミュニケーション', '上司', '部下', '同僚', '職場', 'スキル', 'スキルアップ',
    'キャリアパス', '昇進', '給与', '評価', '面接', '人事', '採用', 'hr', '労働', '雇用',
    'フリーランス', '副業', '起業', 'ビジネス', '営業', 'マーケティング', 'プレゼン', '資料作成'
  ],
  '文化': [
    '文化', '芸術', '美術', '音楽', '映画', '文学', '小説', '詩', '演劇', 'アート', '絵画', '彫刻',
    '歴史', '哲学', '宗教', '社会', '人類学', '民族', '伝統', '風習', '祭り', '神話', '民俗',
    'ライフスタイル', 'ファッション', 'デザイン', 'アニメ', '漫画', 'ゲーム', 'エンタメ',
    '美学', '批評', '文芸', '詩人', '作家', '画家', 'アーティスト', 'ギャラリー', '展覧会',
    '建築', '庭園', '工芸', '陶芸', '書道', '茶道', '華道'
  ],
  '科学': [
    '科学', '物理', '化学', '生物', '医学', '天文', '地球', '環境', '気候', '宇宙', '惑星',
    '研究', '実験', '理論', '発見', 'テクノロジー', 'イノベーション', '技術',
    '数学', '統計', '量子', 'dna', '遺伝', '進化', '脳', '心理学', '認知科学', '神経科学',
    '医療', '薬', '治療', '病気', 'ウイルス', '細菌', '免疫', 'がん',
    '生態系', '生物学', '分子', '原子', '素粒子', 'エネルギー', '相対性理論',
    'ナノテクノロジー', 'バイオ', '再生医療', 'ips細胞'
  ],
  '日常': [
    '日常', '生活', '暮らし', '家族', '育児', '子育て', '料理', 'レシピ', '健康', '食事',
    '睡眠', '運動', 'ダイエット', '美容', '旅行', '趣味', 'ペット', '掃除', '洗濯',
    '整理', '片付け', '節約', '買い物', 'グルメ', 'カフェ', 'レストラン', '外食',
    '散歩', 'ランニング', 'ヨガ', 'ストレッチ', 'フィットネス', 'ジム',
    '読書', '映画鑑賞', '音楽鑑賞', 'ガーデニング', 'diy', '手芸', '編み物',
    '恋愛', '結婚', '友人', '人間関係', 'コミュニティ', 'ライフハック'
  ],
  'その他': []  // デフォルト（マッチしない場合）
}

/**
 * タイトルからカテゴリを自動判定
 * @param title - 記事のタイトル
 * @returns マッチしたカテゴリ、マッチしない場合は'その他'
 */
export function detectCategory(title: string): ReadingCategory {
  const normalizedTitle = title.toLowerCase()

  // 優先順位: IT > 経済 > 仕事 > 科学 > 文化 > 日常
  // より専門的なカテゴリを優先
  const priorityOrder: ReadingCategory[] = ['IT', '経済', '仕事', '科学', '文化', '日常']

  for (const category of priorityOrder) {
    const keywords = CATEGORY_KEYWORDS[category]
    const hasMatch = keywords.some(keyword =>
      normalizedTitle.includes(keyword.toLowerCase())
    )

    if (hasMatch) {
      return category
    }
  }

  return 'その他'
}

/**
 * キーワードマッチングのスコアを計算（将来の拡張用）
 * 複数のカテゴリにマッチする場合に、最も関連性が高いカテゴリを選択
 */
export function calculateCategoryScore(title: string, category: ReadingCategory): number {
  const normalizedTitle = title.toLowerCase()
  const keywords = CATEGORY_KEYWORDS[category]

  let score = 0
  keywords.forEach(keyword => {
    if (normalizedTitle.includes(keyword.toLowerCase())) {
      score++
    }
  })

  return score
}

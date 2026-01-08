# 日記データの管理方法

日記は月単位でファイルを分けて管理します。

## ディレクトリ構成

```
daily_data/
├── README.md              # このファイル
├── entries.ts             # 全ての月の日記を統合
├── template.md            # 日別のテンプレート（参考用）
├── template-month.ts      # 月別ファイルのテンプレート
└── 2026/
    ├── 2026-01.ts        # 2026年1月の日記
    ├── 2026-02.ts        # 2026年2月の日記
    └── ...
```

## 新しい日記を追加する方法

### 1. 同じ月の日記を追加する場合

該当月のファイル（例: `2026/2026-01.ts`）に日記エントリを追加します。

```typescript
export const entries_2026_01: DailyEntry[] = [
  {
    id: '2026-01-08',
    date: '2026-01-08',
    content: `# 2026年1月8日
...
`,
  },
  // 新しい日記を追加
  {
    id: '2026-01-09',
    date: '2026-01-09',
    content: `# 2026年1月9日

## 今日やったこと
-

## 学んだこと
-

## 明日やること
-
`,
  },
]
```

### 2. 新しい月の日記を追加する場合

#### ステップ1: 新しい月のファイルを作成

`template-month.ts` をコピーして、新しい月のファイルを作成します。

```bash
# 例: 2026年2月のファイルを作成
cp template-month.ts 2026/2026-02.ts
```

#### ステップ2: ファイル内容を編集

- 配列名を `entries_YYYY_MM` から実際の年月に変更（例: `entries_2026_02`）
- 日記エントリを追加

```typescript
import type { DailyEntry } from '../../types/daily'

// 2026年2月の日記
export const entries_2026_02: DailyEntry[] = [
  {
    id: '2026-02-01',
    date: '2026-02-01',
    content: `# 2026年2月1日

## 今日やったこと
-

## 学んだこと
-

## 明日やること
-
`,
  },
]
```

#### ステップ3: entries.tsに追加

`entries.ts` に新しい月のファイルをインポートして追加します。

```typescript
import type { DailyEntry } from '../types/daily'

// 月別の日記ファイルをインポート
import { entries_2026_01 } from './2026/2026-01'
import { entries_2026_02 } from './2026/2026-02' // 追加

// 全ての月の日記を統合
export const dailyEntries: DailyEntry[] = [
  ...entries_2026_01,
  ...entries_2026_02, // 追加
]
```

## 日記のフォーマット

日記は以下のMarkdown形式で記述します：

```markdown
# YYYY年MM月DD日

## 今日やったこと
- 箇条書きで記述

## 学んだこと
- 箇条書きで記述

## 明日やること
- 箇条書きで記述
```

フォーマットは自由に変更できます。Markdown形式であればどのような形式でも表示できます。

## 注意事項

- IDと日付は必ず `YYYY-MM-DD` 形式で統一してください
- 月別ファイルの配列名は `entries_YYYY_MM` の形式にしてください
- 日記は日付の新しい順に自動でソートされるため、ファイル内での順序は気にしなくて大丈夫です

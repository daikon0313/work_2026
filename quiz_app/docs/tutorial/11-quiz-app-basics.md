
# Step 11: クイズアプリの基礎

ここまで学んだ知識を使って、実際にクイズアプリを作ります！

## 🎯 このステップで学ぶこと

このステップでは、今まで学んだことを全部使って、本格的なアプリを作ります：

- **複数の State を組み合わせる** → アプリの色々な状態を管理する方法
- **クイズの進行管理** → 質問を順番に表示する仕組み
- **スコア計算** → 正解数を数える方法
- **画面の切り替え** → クイズ画面とスコア画面を切り替える方法

### 🔰 始める前に知っておくこと

このチュートリアルを理解するには、以下の知識が必要です：
- `useState` の基本的な使い方
- `map` を使った配列の繰り返し処理
- `if` 文を使った条件分岐
- イベントハンドラ（`onClick` など）の使い方

まだ自信がない方は、前のステップを復習してから進みましょう！

## 📚 クイズアプリの仕様

### 機能
1. 質問を1問ずつ表示
2. 選択肢をクリックして回答
3. 正解/不正解をすぐに表示（ボタンの色が変わる）
4. 次の質問へ進む
5. 最後にスコアを表示
6. もう一度挑戦できる

### 必要なデータ

クイズアプリには「質問」「選択肢」「正解」の情報が必要です。

まず、**型（type）** を定義します。型とは「データの設計図」のようなものです：

```typescript
type QuizQuestion = {
  id: number              // 質問の識別番号（1, 2, 3...）
  question: string        // 質問文（文字列）
  options: string[]       // 選択肢の配列（複数の文字列）
  correctAnswer: number   // 正解の選択肢の番号（0から始まる）
}
```

#### 🔍 各項目の説明

| 項目 | 型 | 説明 | 例 |
|------|-----|------|-----|
| `id` | `number` | 質問を識別するための番号 | `1`, `2`, `3` |
| `question` | `string` | 質問の文章 | `"日本の首都はどこですか?"` |
| `options` | `string[]` | 選択肢のリスト（配列） | `['大阪', '京都', '東京', '名古屋']` |
| `correctAnswer` | `number` | 正解の選択肢の位置 | `2`（3番目の「東京」） |

#### ⚠️ 超重要：インデックスは 0 から始まる！

プログラミングでは、リストの番号は **0 から始まります**。これを「インデックス」と呼びます：

```
選択肢: ['大阪', '京都', '東京', '名古屋']
          ↓       ↓       ↓       ↓
インデックス: 0       1       2       3
```

つまり：
- **インデックス 0** = 1番目の選択肢（'大阪'）
- **インデックス 1** = 2番目の選択肢（'京都'）
- **インデックス 2** = 3番目の選択肢（'東京'） ← 正解
- **インデックス 3** = 4番目の選択肢（'名古屋'）

この例では、「東京」が正解なので `correctAnswer: 2` となります。

## ✍️ Step 11-1: データの準備

### 📁 ステップ1: ファイルとフォルダの作成

まず、データを保存するためのフォルダとファイルを作ります：

```
src/
  └── data/
      └── quizData.ts  ← これを作ります
```

### 📝 ステップ2: データファイルの作成

`src/data/quizData.ts` を作成して、以下のコードを入力します：

```typescript
export type QuizQuestion = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

export const quizData: QuizQuestion[] = [
  {
    id: 1,
    question: '日本の首都はどこですか?',
    options: ['大阪', '京都', '東京', '名古屋'],
    correctAnswer: 2  // '東京' はインデックス2（3番目）
  },
  {
    id: 2,
    question: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1  // '2' はインデックス1（2番目）
  },
  {
    id: 3,
    question: 'Reactのフックで状態管理に使うのは？',
    options: ['useState', 'useEffect', 'useContext', 'useRef'],
    correctAnswer: 0  // 'useState' はインデックス0（1番目）
  }
]
```

### 🔍 コードの詳しい解説

#### 1️⃣ 型定義（QuizQuestion）

```typescript
export type QuizQuestion = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}
```

**これは何？**
- クイズの「設計図」です
- すべての質問は、この形式に従う必要があります

**各項目の意味**：
```typescript
{
  id: 1,                                      // ① 質問の番号
  question: '日本の首都はどこですか?',          // ② 質問文
  options: ['大阪', '京都', '東京', '名古屋'], // ③ 選択肢（配列）
  correctAnswer: 2                            // ④ 正解のインデックス
}
```

#### 2️⃣ データの配列（quizData）

```typescript
export const quizData: QuizQuestion[] = [ ... ]
```

- `QuizQuestion[]` = QuizQuestion型の配列
- 複数の質問を `[ ]` の中に入れて管理
- `export` = 他のファイルからも使えるようにする

### 💡 重要なポイント

#### ポイント1: `export` キーワード

```typescript
export type QuizQuestion = { ... }    // ✅ 他のファイルで使える
export const quizData = [ ... ]       // ✅ 他のファイルで使える
```

`export` をつけないと、他のファイルから使えません！

#### ポイント2: 配列のインデックスは 0 から始まる

```
選択肢の配列:
['大阪',    '京都',    '東京',    '名古屋']
  ↓         ↓         ↓         ↓
  0         1         2         3     ← インデックス
```

「東京」は3番目の選択肢ですが、**インデックスは 2** です！

#### ポイント3: `correctAnswer` の指定方法

間違った例：
```typescript
// ❌ 間違い！（人間の数え方）
options: ['大阪', '京都', '東京', '名古屋'],
correctAnswer: 3  // 「東京は3番目だから3」は間違い！
```

正しい例：
```typescript
// ✅ 正解！（プログラムの数え方）
options: ['大阪', '京都', '東京', '名古屋'],
correctAnswer: 2  // インデックスは0から始まるので2
```

### 🎯 練習問題

以下の質問データを追加してみましょう：

**質問**: TypeScriptの拡張子は？
**選択肢**: `.js`, `.ts`, `.jsx`, `.py`
**正解**: `.ts`（2番目）

<details>
<summary>答えを見る</summary>

```typescript
{
  id: 4,
  question: 'TypeScriptの拡張子は？',
  options: ['.js', '.ts', '.jsx', '.py'],
  correctAnswer: 1  // '.ts' はインデックス1
}
```

「.ts」は2番目の選択肢ですが、インデックスは **1** になります！
</details>

## 🎨 Step 11-2: クイズコンポーネントの作成

クイズのメインとなるコンポーネントを作ります。このコンポーネントは大きく分けて3つの役割があります：

1. **State の管理** - クイズの状態を記憶する
2. **ロジック** - 回答の判定や次の質問への移動
3. **表示** - クイズ画面とスコア画面の表示

`src/quiz_components/Quiz.tsx` を作成：

```tsx
import { useState } from 'react'
import { quizData } from '../data/quizData'

function Quiz(): JSX.Element {
  // ========================================
  // 1️⃣ State の定義（アプリの「記憶」）
  // ========================================

  // 現在表示している質問の番号（0から始まる）
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // 正解した数
  const [score, setScore] = useState(0)

  // 全問終了後、スコア画面を表示するか
  const [showScore, setShowScore] = useState(false)

  // ユーザーが選んだ回答（null = まだ選んでいない）
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  // ========================================
  // 2️⃣ データの取得
  // ========================================

  // quizData配列から現在の質問を取得
  // 例: currentQuestionIndex が 0 なら quizData[0] を取得
  const currentQuestion = quizData[currentQuestionIndex]

  // ========================================
  // 3️⃣ イベントハンドラ（ユーザーの操作に反応）
  // ========================================

  // 回答ボタンをクリックしたとき
  const handleAnswerClick = (answerIndex: number) => {
    // 選んだ回答を記録
    setSelectedAnswer(answerIndex)

    // 正解かどうかチェック
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)  // 正解ならスコアを+1
    }
  }

  // 「次の質問へ」ボタンをクリックしたとき
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1

    // まだ質問が残っているか？
    if (nextQuestion < quizData.length) {
      // 次の質問に進む
      setCurrentQuestionIndex(nextQuestion)
      setSelectedAnswer(null)  // 選択をリセット
    } else {
      // 全問終了：スコア画面を表示
      setShowScore(true)
    }
  }

  // 「もう一度挑戦」ボタンをクリックしたとき
  const handleRestart = () => {
    // すべての State を初期値に戻す
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowScore(false)
    setSelectedAnswer(null)
  }

  // ========================================
  // 4️⃣ スコア画面の表示
  // ========================================

  if (showScore) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>クイズ終了！</h1>
        <p style={{ fontSize: '24px' }}>
          スコア: {score} / {quizData.length}
        </p>
        <p>正解率: {Math.round((score / quizData.length) * 100)}%</p>
        <button
          onClick={handleRestart}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          もう一度挑戦
        </button>
      </div>
    )
  }

  // ========================================
  // 5️⃣ クイズ画面の表示
  // ========================================

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* 進捗表示 */}
      <div style={{ marginBottom: '20px' }}>
        <p>質問 {currentQuestionIndex + 1} / {quizData.length}</p>
      </div>

      {/* 質問文 */}
      <h2 style={{ marginBottom: '30px' }}>{currentQuestion.question}</h2>

      {/* 選択肢ボタン */}
      <div style={{ marginBottom: '20px' }}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}  // 回答後は選択不可
            style={{
              display: 'block',
              width: '100%',
              padding: '15px',
              margin: '10px 0',
              fontSize: '16px',
              // 色の変更ロジック
              backgroundColor:
                selectedAnswer === null
                  ? '#f0f0f0'  // 未回答: グレー
                  : index === currentQuestion.correctAnswer
                  ? '#4CAF50'  // 正解: 緑
                  : selectedAnswer === index
                  ? '#f44336'  // 不正解（選んだもの）: 赤
                  : '#f0f0f0', // その他: グレー
              color:
                selectedAnswer !== null &&
                (index === currentQuestion.correctAnswer || selectedAnswer === index)
                  ? 'white'
                  : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedAnswer === null ? 'pointer' : 'not-allowed'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 回答後のメッセージと「次へ」ボタン */}
      {selectedAnswer !== null && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            {selectedAnswer === currentQuestion.correctAnswer
              ? '✅ 正解！'
              : '❌ 不正解...'}
          </p>
          <button
            onClick={handleNextQuestion}
            style={{
              padding: '10px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {currentQuestionIndex + 1 < quizData.length ? '次の質問へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz
```

### 📝 コードの詳しい解説

#### 🧠 State とは何か？

Stateは **アプリの「記憶」** です。ユーザーの操作によって変わる情報を保存します。

**例えば**：
- ゲームのスコア
- 入力フォームの内容
- どのページを表示しているか
- ボタンがクリックされたか

これらの情報は、ユーザーが何かをするたびに変わります。Reactは **State が変わると自動的に画面を更新** します。

#### 4つの State の役割

このクイズアプリでは **4つのState** を使います。それぞれがアプリの異なる部分を「記憶」しています：

```tsx
// 1️⃣ どの質問を表示するか
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
// 初期値: 0（最初の質問）

// 2️⃣ 何問正解したか
const [score, setScore] = useState(0)
// 初期値: 0点

// 3️⃣ スコア画面を表示するか
const [showScore, setShowScore] = useState(false)
// 初期値: false（クイズ画面を表示）

// 4️⃣ どの選択肢を選んだか
const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
// 初期値: null（まだ何も選んでいない）
```

#### 🎯 State の構造を理解する

Stateは **2つの部分** から成り立っています：

```tsx
const [value, setValue] = useState(initialValue)
//     ①      ②                   ③
```

1. **value** = 現在の値（読み取り専用）
2. **setValue** = 値を変更する関数
3. **initialValue** = 最初の値

**具体例**：
```tsx
const [score, setScore] = useState(0)

console.log(score)      // 0 を表示
setScore(5)             // スコアを 5 に変更
console.log(score)      // 次の再描画で 5 を表示
```

#### 🔄 State が変わると何が起こる？

```
ユーザーがボタンをクリック
         ↓
State を更新（例: setScore(1)）
         ↓
React が変更を検知
         ↓
コンポーネントが再描画される
         ↓
画面が自動的に更新される
```

#### 💡 なぜ4つも State が必要なのか？

それぞれが **独立した情報** を管理しているからです：

| State | 記憶する内容 | 例 |
|------|------------|-----|
| `currentQuestionIndex` | 今何問目？ | `0` → 1問目<br>`1` → 2問目 |
| `score` | 何問正解した？ | `0` → 0問正解<br>`2` → 2問正解 |
| `showScore` | どの画面を表示？ | `false` → クイズ画面<br>`true` → スコア画面 |
| `selectedAnswer` | 何番を選んだ？ | `null` → 未回答<br>`2` → 3番目を選択 |

#### 🎬 実際の動作例

ユーザーがクイズに答えるときの State の変化を見てみましょう：

**初期状態**：
```tsx
currentQuestionIndex: 0
score: 0
showScore: false
selectedAnswer: null
```

**ユーザーが正解の選択肢（インデックス2）をクリック**：
```tsx
currentQuestionIndex: 0        // 変わらず
score: 1                       // 0 → 1 に増加！
showScore: false               // 変わらず
selectedAnswer: 2              // null → 2 に変更！
```

**「次の質問へ」ボタンをクリック**：
```tsx
currentQuestionIndex: 1        // 0 → 1 に増加！
score: 1                       // 変わらず
showScore: false               // 変わらず
selectedAnswer: null           // 2 → null にリセット！
```

**最後の質問を終えたとき**：
```tsx
currentQuestionIndex: 2        // 変わらず
score: 2                       // 正解なら増加
showScore: true                // false → true に変更！
selectedAnswer: 2              // 変わらず
```

#### ⚠️ State の重要なルール

1. **直接変更してはダメ！**
   ```tsx
   // ❌ 間違い
   score = score + 1

   // ✅ 正しい
   setScore(score + 1)
   ```

2. **State の更新は非同期**
   ```tsx
   setScore(5)
   console.log(score)  // まだ 5 にならない！次の再描画で変わる
   ```

3. **前の State を使って更新する場合**
   ```tsx
   // ✅ より安全な方法
   setScore(prevScore => prevScore + 1)
   ```

#### ⚡ イベントハンドラとは？

**イベントハンドラ** = ユーザーの操作に反応する関数です。

**例**：
- ボタンをクリック → `onClick`
- 入力欄に入力 → `onChange`
- マウスを乗せる → `onMouseOver`

このアプリでは **3つのイベントハンドラ** を使います。

---

#### 1️⃣ `handleAnswerClick` - 回答ボタンをクリックしたとき

```tsx
const handleAnswerClick = (answerIndex: number) => {
  setSelectedAnswer(answerIndex)  // 選んだ番号を記録

  if (answerIndex === currentQuestion.correctAnswer) {
    setScore(score + 1)  // 正解ならスコアを1増やす
  }
}
```

**動作の流れ（視覚的に理解）**：

```
┌─────────────────────────────────────────────┐
│ ユーザーが選択肢2をクリック                   │
└─────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ handleAnswerClick(2) が呼ばれる               │
└─────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ setSelectedAnswer(2)                         │
│ → selectedAnswer が null から 2 に変わる      │
└─────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 正解かチェック:                               │
│ answerIndex === currentQuestion.correctAnswer│
└─────────────────────────────────────────────┘
         ↙          ↘
      正解           不正解
       ↓              ↓
  setScore(1)      何もしない
       ↓              ↓
┌─────────────────────────────────────────────┐
│ 画面が再描画される                            │
│ → ボタンの色が変わる                          │
│ → 「次の質問へ」ボタンが表示される             │
└─────────────────────────────────────────────┘
```

**具体例で理解**：

質問：「1 + 1 = ?」
- 選択肢: `['1', '2', '3', '4']`
- 正解: インデックス 1（'2'）

ユーザーが **インデックス 1** をクリックした場合：
```tsx
handleAnswerClick(1) が実行
→ selectedAnswer = 1
→ 1 === 1（正解！）
→ score が 0 → 1 に増える
→ 画面が更新される
```

ユーザーが **インデックス 2** をクリックした場合：
```tsx
handleAnswerClick(2) が実行
→ selectedAnswer = 2
→ 2 !== 1（不正解...）
→ score は変わらない
→ 画面が更新される
```

---

#### 2️⃣ `handleNextQuestion` - 次の質問へ進むとき

```tsx
const handleNextQuestion = () => {
  const nextQuestion = currentQuestionIndex + 1

  if (nextQuestion < quizData.length) {
    // まだ質問がある → 次の質問へ
    setCurrentQuestionIndex(nextQuestion)
    setSelectedAnswer(null)
  } else {
    // 質問がもうない → スコア画面へ
    setShowScore(true)
  }
}
```

**動作の流れ（フローチャート）**：

```
┌────────────────────────┐
│「次の質問へ」をクリック  │
└────────────────────────┘
          ↓
┌────────────────────────┐
│ nextQuestion を計算      │
│ = currentQuestionIndex+1│
└────────────────────────┘
          ↓
┌─────────────────────────────┐
│ まだ質問がある？              │
│ nextQuestion < quizData.length│
└─────────────────────────────┘
    ↙              ↘
  YES              NO
   ↓                ↓
┌──────────┐   ┌──────────┐
│次の質問へ │   │終了処理   │
└──────────┘   └──────────┘
   ↓                ↓
┌──────────────────┐  ┌───────────────┐
│setCurrentQuestion│  │setShowScore   │
│Index(nextQuestion)│  │(true)         │
└──────────────────┘  └───────────────┘
   ↓                ↓
┌──────────────────┐  ┌───────────────┐
│setSelectedAnswer │  │スコア画面を    │
│(null)            │  │表示            │
└──────────────────┘  └───────────────┘
```

**具体例**：

全部で3問のクイズの場合（`quizData.length = 3`）：

**1問目を終えたとき**：
```tsx
currentQuestionIndex = 0
nextQuestion = 0 + 1 = 1
1 < 3 → まだある！
→ currentQuestionIndex = 1（2問目へ）
→ selectedAnswer = null（選択をリセット）
```

**2問目を終えたとき**：
```tsx
currentQuestionIndex = 1
nextQuestion = 1 + 1 = 2
2 < 3 → まだある！
→ currentQuestionIndex = 2（3問目へ）
→ selectedAnswer = null
```

**3問目を終えたとき**：
```tsx
currentQuestionIndex = 2
nextQuestion = 2 + 1 = 3
3 < 3 → false（もうない！）
→ showScore = true（スコア画面へ）
```

---

#### 3️⃣ `handleRestart` - リスタートボタンをクリックしたとき

```tsx
const handleRestart = () => {
  setCurrentQuestionIndex(0)
  setScore(0)
  setShowScore(false)
  setSelectedAnswer(null)
}
```

**動作**：すべてのStateを初期値に戻す

```
リスタート前:
currentQuestionIndex: 2
score: 2
showScore: true
selectedAnswer: 1

      ↓ handleRestart() 実行 ↓

リスタート後:
currentQuestionIndex: 0  ← 最初の質問
score: 0                 ← スコアリセット
showScore: false         ← クイズ画面に戻る
selectedAnswer: null     ← 選択リセット
```

---

#### 🎨 ボタンの色が変わる仕組み

回答後、ボタンの色が自動で変わります。これは **三項演算子** を使った条件分岐です。

```tsx
backgroundColor:
  selectedAnswer === null
    ? '#f0f0f0'  // 回答前 → 全部グレー
    : index === currentQuestion.correctAnswer
    ? '#4CAF50'  // 正解の選択肢 → 緑
    : selectedAnswer === index
    ? '#f44336'  // 自分が選んだ不正解 → 赤
    : '#f0f0f0'  // その他 → グレー
```

**三項演算子の読み方**：
```
条件 ? 真の場合 : 偽の場合
```

**視覚的に理解する**：

質問: 「1 + 1 = ?」
- 選択肢: `['1', '2', '3', '4']`
- 正解: インデックス 1（'2'）
- ユーザーが選択: インデックス 2（'3'）

**回答前** (`selectedAnswer = null`)：
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │ │  4  │
│ グレー│ │ グレー│ │ グレー│ │ グレー│
└─────┘ └─────┘ └─────┘ └─────┘
```

**回答後** (`selectedAnswer = 2`)：
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │ │  4  │
│ グレー│ │  緑  │ │  赤  │ │ グレー│
└─────┘ └─────┘ └─────┘ └─────┘
          ↑        ↑
        正解    選んだ不正解
```

**色の決定ロジック**：

各ボタンについて、以下の順で判定：

```
1. selectedAnswer === null ?
   → YES: グレー
   → NO: 次へ

2. index === correctAnswer ?
   → YES: 緑（正解）
   → NO: 次へ

3. selectedAnswer === index ?
   → YES: 赤（選んだ不正解）
   → NO: グレー（その他）
```

---

#### 🔄 条件分岐で画面を切り替え

```tsx
if (showScore) {
  return <スコア画面 />
}
return <クイズ画面 />
```

**State によって画面が切り替わる**：

```
showScore = false
      ↓
┌──────────────┐
│ クイズ画面    │
│              │
│ 質問 1/3     │
│ [選択肢]     │
└──────────────┘

      ↓ 最後の質問を終える

showScore = true
      ↓
┌──────────────┐
│ スコア画面    │
│              │
│ 正解: 2/3    │
│ [リスタート] │
└──────────────┘
```

#### 🗺️ map で選択肢を表示

```tsx
{currentQuestion.options.map((option, index) => (
  <button key={index} onClick={() => handleAnswerClick(index)}>
    {option}
  </button>
))}
```

**`map` とは？**

`map` は **配列の各要素を変換する** 関数です。

```
配列.map((要素, インデックス) => 新しい要素)
```

**視覚的に理解する**：

```
元の配列:
['大阪', '京都', '東京', '名古屋']
  ↓       ↓       ↓       ↓

map で各要素を変換:
  ↓       ↓       ↓       ↓

ボタンの配列:
[Button, Button, Button, Button]
```

**ステップバイステップで理解**：

**元のデータ**：
```tsx
options: ['大阪', '京都', '東京', '名古屋']
```

**map の処理**：

```
1回目のループ:
  option = '大阪'
  index = 0
  → <button onClick={() => handleAnswerClick(0)}>大阪</button>

2回目のループ:
  option = '京都'
  index = 1
  → <button onClick={() => handleAnswerClick(1)}>京都</button>

3回目のループ:
  option = '東京'
  index = 2
  → <button onClick={() => handleAnswerClick(2)}>東京</button>

4回目のループ:
  option = '名古屋'
  index = 3
  → <button onClick={() => handleAnswerClick(3)}>名古屋</button>
```

**最終的な出力**：
```tsx
<button onClick={() => handleAnswerClick(0)}>大阪</button>
<button onClick={() => handleAnswerClick(1)}>京都</button>
<button onClick={() => handleAnswerClick(2)}>東京</button>
<button onClick={() => handleAnswerClick(3)}>名古屋</button>
```

**実際の画面**：
```
┌──────────────┐
│    大阪      │ ← クリックすると handleAnswerClick(0)
└──────────────┘
┌──────────────┐
│    京都      │ ← クリックすると handleAnswerClick(1)
└──────────────┘
┌──────────────┐
│    東京      │ ← クリックすると handleAnswerClick(2)
└──────────────┘
┌──────────────┐
│   名古屋     │ ← クリックすると handleAnswerClick(3)
└──────────────┘
```

**重要なポイント**：

1. **key 属性**
   ```tsx
   <button key={index} ...>
   ```
   - Reactが各要素を識別するために必要
   - リストをレンダリングするときは **必須**

2. **アロー関数の使い方**
   ```tsx
   onClick={() => handleAnswerClick(index)}
   ```
   - `()` で囲むことで、クリック時に実行される
   - `onClick={handleAnswerClick(index)}` は **間違い**（すぐに実行される）

3. **map は新しい配列を返す**
   ```tsx
   const numbers = [1, 2, 3]
   const doubled = numbers.map(n => n * 2)
   // doubled = [2, 4, 6]
   ```

## 🔧 Step 11-3: main.tsx と App.tsx の設定

### main.tsx（エントリーポイント）

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**役割**：
- Reactアプリの開始点
- `index.html` の `<div id="root">` に App を描画

### App.tsx（メインコンポーネント）

```tsx
import Quiz from './quiz_components/Quiz'
import './App.css'

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', padding: '20px' }}>
        React クイズアプリ
      </h1>
      <Quiz />
    </div>
  )
}

export default App
```

**役割**：
- アプリ全体のレイアウト
- タイトルを表示
- Quiz コンポーネントを配置

## 📊 State の設計

このアプリでは4つの State を使っています：

| State | 型 | 初期値 | 役割 |
|---|---|---|---|
| `currentQuestionIndex` | `number` | `0` | 現在の質問番号 |
| `score` | `number` | `0` | 正解数 |
| `showScore` | `boolean` | `false` | スコア画面表示フラグ |
| `selectedAnswer` | `number \| null` | `null` | 選択した回答 |

## 🎯 アプリ全体の動作フロー

このセクションでは、クイズアプリがどのように動作するかを **視覚的に** 理解します。

### 📋 全体の流れ

```
┌─────────────────┐
│   アプリ起動     │
└─────────────────┘
         ↓
┌─────────────────────────────────┐
│ 初期状態（State の設定）         │
│ currentQuestionIndex: 0          │
│ score: 0                         │
│ showScore: false                 │
│ selectedAnswer: null             │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 質問1を表示                      │
│ ┌─────────────┐                 │
│ │日本の首都は？│                 │
│ └─────────────┘                 │
│ [大阪] [京都] [東京] [名古屋]    │
└─────────────────────────────────┘
         ↓
    ユーザーが選択
         ↓
┌─────────────────────────────────┐
│ handleAnswerClick(2) 実行        │
│ → selectedAnswer = 2             │
│ → 正解判定                       │
│ → score = 1（正解の場合）        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 画面が自動更新                   │
│ ┌─────────────┐                 │
│ │日本の首都は？│                 │
│ └─────────────┘                 │
│ [大阪] [京都] [東京] [名古屋]    │
│  グレー グレー  緑    グレー      │
│               ↑                  │
│         ✅ 正解！                │
│      [次の質問へ]                │
└─────────────────────────────────┘
         ↓
  「次の質問へ」クリック
         ↓
┌─────────────────────────────────┐
│ handleNextQuestion() 実行        │
│ → currentQuestionIndex = 1       │
│ → selectedAnswer = null          │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ 質問2を表示                      │
│ ┌─────────────┐                 │
│ │1 + 1 = ?    │                 │
│ └─────────────┘                 │
│ [1] [2] [3] [4]                 │
└─────────────────────────────────┘
         ↓
    ... 繰り返し ...
         ↓
┌─────────────────────────────────┐
│ 最後の質問（質問3）              │
│ 回答完了                         │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ handleNextQuestion() 実行        │
│ → nextQuestion = 3               │
│ → 3 < 3（質問がない）            │
│ → showScore = true               │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ スコア画面を表示                 │
│ ┌───────────────┐               │
│ │クイズ終了！   │               │
│ │スコア: 2/3    │               │
│ │正解率: 67%    │               │
│ │[もう一度挑戦] │               │
│ └───────────────┘               │
└─────────────────────────────────┘
         ↓
  「もう一度挑戦」クリック
         ↓
┌─────────────────────────────────┐
│ handleRestart() 実行             │
│ → currentQuestionIndex = 0       │
│ → score = 0                      │
│ → showScore = false              │
│ → selectedAnswer = null          │
└─────────────────────────────────┘
         ↓
      最初に戻る
```

### 🔄 State の変化を追跡

各ステップで State がどのように変化するかを見てみましょう：

| ステップ | currentQuestionIndex | score | showScore | selectedAnswer | 画面 |
|----------|---------------------|-------|-----------|----------------|------|
| **初期状態** | 0 | 0 | false | null | 質問1 |
| **質問1に回答** | 0 | 1 | false | 2 | 質問1（色変化） |
| **次の質問へ** | 1 | 1 | false | null | 質問2 |
| **質問2に回答** | 1 | 1 | false | 0 | 質問2（色変化） |
| **次の質問へ** | 2 | 1 | false | null | 質問3 |
| **質問3に回答** | 2 | 2 | false | 0 | 質問3（色変化） |
| **結果を見る** | 2 | 2 | true | 0 | スコア画面 |
| **リスタート** | 0 | 0 | false | null | 質問1 |

### 🎬 実際の動作シーン

**シーン1: 質問に回答**
```
┌──────────────────────┐
│ 日本の首都はどこ？    │
└──────────────────────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│大阪│ │京都│ │東京│ │名古屋│  ← 未回答（全部グレー）
└────┘ └────┘ └────┘ └────┘

        ユーザーが「東京」をクリック
               ↓

┌──────────────────────┐
│ 日本の首都はどこ？    │
└──────────────────────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│大阪│ │京都│ │東京│ │名古屋│  ← 色が変わる！
│灰色│ │灰色│ │緑色│ │灰色 │
└────┘ └────┘ └────┘ └────┘
              ↑
          ✅ 正解！
     ┌──────────────┐
     │ 次の質問へ   │
     └──────────────┘
```

**シーン2: 間違えた場合**
```
┌──────────────────────┐
│ 1 + 1 = ?            │
└──────────────────────┘
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │
└───┘ └───┘ └───┘ └───┘

    ユーザーが「3」をクリック
           ↓

┌──────────────────────┐
│ 1 + 1 = ?            │
└──────────────────────┘
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │
│灰色│ │緑色│ │赤色│ │灰色│
└───┘ └───┘ └───┘ └───┘
        ↑      ↑
      正解  選んだ不正解
     ❌ 不正解...
```

## 🐛 よくあるエラーと解決方法

### エラー1: 画面が真っ白

**原因**：
- `main.tsx` で `createRoot` でレンダリングしていない
- インポートパスが間違っている

**解決方法**：
```tsx
// ❌ 間違い
import Quiz from './components/Quiz'

// ✅ 正しい
import Quiz from './quiz_components/Quiz'
```

### エラー2: `Cannot find module`

**原因**：
- ファイルが正しいディレクトリにない
- ファイル名が間違っている

**解決方法**：
- `src/data/quizData.ts` が存在するか確認
- `src/quiz_components/Quiz.tsx` が存在するか確認

### エラー3: 正解のボタンが緑にならない

**原因**：
- `correctAnswer` のインデックスが間違っている

**解決方法**：
```typescript
// ❌ 間違い（1始まりで数えている）
options: ['大阪', '京都', '東京', '名古屋'],
correctAnswer: 3  // '東京' は3番目？→ 間違い！

// ✅ 正しい（0始まりで数える）
options: ['大阪', '京都', '東京', '名古屋'],
correctAnswer: 2  // '東京' はインデックス2
```

## 💪 拡張アイデア

このクイズアプリを拡張してみましょう：

### レベル1: 基本的な拡張
- [ ] 質問をさらに追加する
- [ ] カテゴリ別の質問を追加（歴史、科学、スポーツなど）
- [ ] タイマー機能を追加

### レベル2: 中級の拡張
- [ ] 間違えた問題を記録して復習機能を作る
- [ ] 難易度を選択できるようにする（簡単・普通・難しい）
- [ ] ランダムに質問を出題する

### レベル3: 上級の拡張
- [ ] ローカルストレージでスコアを保存
- [ ] ランキング機能（ハイスコアを記録）
- [ ] アニメーション効果を追加（フェードイン・フェードアウト）

## ✅ チェックポイント

以下を確認してください：

- [ ] クイズアプリが動作する
- [ ] 質問が順番に表示される
- [ ] 正解/不正解の判定が正しい
- [ ] ボタンの色が正しく変わる（正解=緑、不正解=赤）
- [ ] スコアが正しく計算される
- [ ] リスタートできる

## 🎓 理解度チェック

### 質問 1
`selectedAnswer` State の役割は何ですか？

<details>
<summary>答えを見る</summary>

ユーザーが選択した回答を記録し、以下の用途で使用：
1. ボタンの色を変える（正解は緑、不正解は赤）
2. 回答後は再度選択できないようにする
3. 「次の質問へ」ボタンを表示する
4. 正解/不正解のメッセージを表示する
</details>

### 質問 2
なぜ `currentQuestionIndex` が必要ですか？

<details>
<summary>答えを見る</summary>

配列 `quizData` から現在表示すべき質問を取得するためのインデックスです。この値を変更することで、次の質問に進むことができます。

例：
- `currentQuestionIndex = 0` → 1問目
- `currentQuestionIndex = 1` → 2問目
- `currentQuestionIndex = 2` → 3問目
</details>

### 質問 3
`handleNextQuestion` 関数は何をしていますか？

<details>
<summary>答えを見る</summary>

次の質問に進む、または全問終了してスコア画面を表示する関数です：

1. 次の質問のインデックスを計算（`currentQuestionIndex + 1`）
2. まだ質問が残っているかチェック（`nextQuestion < quizData.length`）
3. 残っていれば：
   - 質問インデックスを更新
   - 選択をリセット（`setSelectedAnswer(null)`）
4. 残っていなければ：
   - スコア画面を表示（`setShowScore(true)`）
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ 複数の State を組み合わせてアプリを作る
- ✅ 条件分岐でUIを切り替える（クイズ画面 ⇔ スコア画面）
- ✅ 配列データを扱う（`map` で繰り返し）
- ✅ イベント処理とState更新を組み合わせる
- ✅ 三項演算子で動的にスタイルを変更する

## おめでとうございます！ 🎉

React と TypeScript の基礎を学び、実際に動くアプリケーションを作成できました！

### 次のステップ
- より複雑な機能を追加してみる
- 他のアプリケーションを作ってみる（TODOアプリ、天気アプリなど）
- React の公式ドキュメントでさらに学ぶ

---

💡 **ヒント**: このクイズアプリを自分なりにカスタマイズして、オリジナルのアプリを作ってみましょう！

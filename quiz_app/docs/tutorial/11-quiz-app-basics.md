# Step 11: クイズアプリの基礎

ここまで学んだ知識を使って、実際にクイズアプリを作ります！

## 🎯 このステップで学ぶこと

- 複数の State を組み合わせたアプリケーション
- クイズの進行管理
- スコア計算
- 完成したアプリの構造

## 📚 クイズアプリの仕様

### 機能
1. 質問を1問ずつ表示
2. 選択肢をクリックして回答
3. 次の質問へ進む
4. 最後にスコアを表示

### 必要なデータ
```typescript
type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: number  // 正解の選択肢のインデックス
}
```

## ✍️ Step 11-1: データの準備

`src/data/quizData.ts` を作成：

```typescript
export type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

export const quizData: Question[] = [
  {
    id: 1,
    question: '日本の首都はどこですか？',
    options: ['大阪', '東京', '京都', '名古屋'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: '地球は何番目の惑星ですか？',
    options: ['1番目', '2番目', '3番目', '4番目'],
    correctAnswer: 2
  }
]
```

## 🎨 Step 11-2: クイズコンポーネントの作成

`src/components/Quiz.tsx` を作成：

```tsx
import { useState } from 'react'
import { quizData, Question } from '../data/quizData'

function Quiz(): JSX.Element {
  // State の定義
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  // 現在の質問を取得
  const currentQuestion = quizData[currentQuestionIndex]

  // 回答を選択
  const handleAnswerClick = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)

    // 正解かチェック
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  // 次の質問へ
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1

    if (nextQuestion < quizData.length) {
      setCurrentQuestionIndex(nextQuestion)
      setSelectedAnswer(null)
    } else {
      setShowScore(true)
    }
  }

  // リセット
  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowScore(false)
    setSelectedAnswer(null)
  }

  // スコア画面
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

  // クイズ画面
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>質問 {currentQuestionIndex + 1} / {quizData.length}</p>
      </div>

      <h2 style={{ marginBottom: '30px' }}>{currentQuestion.question}</h2>

      <div style={{ marginBottom: '20px' }}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
            style={{
              display: 'block',
              width: '100%',
              padding: '15px',
              margin: '10px 0',
              fontSize: '16px',
              backgroundColor:
                selectedAnswer === null
                  ? '#f0f0f0'
                  : index === currentQuestion.correctAnswer
                  ? '#4CAF50'
                  : selectedAnswer === index
                  ? '#f44336'
                  : '#f0f0f0',
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

## 🔧 Step 11-3: App.tsx で使用

```tsx
import Quiz from './components/Quiz'
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

## 📊 State の設計

このアプリでは4つの State を使っています：

```tsx
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
// 現在表示している質問のインデックス

const [score, setScore] = useState(0)
// 現在のスコア

const [showScore, setShowScore] = useState(false)
// スコア画面を表示するかどうか

const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
// 選択された回答（null = 未選択）
```

## 🎯 動作の流れ

1. **初期状態**: 最初の質問を表示
2. **回答選択**: 選択肢をクリック → 正誤判定 → ボタンの色が変わる
3. **次の質問**: 「次の質問へ」ボタンをクリック → 次の質問を表示
4. **終了**: すべての質問が終わったら → スコア画面を表示
5. **リスタート**: 「もう一度挑戦」ボタンをクリック → 最初に戻る

## 💪 拡張アイデア

このクイズアプリを拡張してみましょう：

### レベル1: 基本的な拡張
- [ ] 質問をさらに追加する
- [ ] カテゴリ別の質問を追加
- [ ] タイマー機能を追加

### レベル2: 中級の拡張
- [ ] 間違えた問題を記録して復習機能を作る
- [ ] 難易度を選択できるようにする
- [ ] ランダムに質問を出題する

### レベル3: 上級の拡張
- [ ] ローカルストレージでスコアを保存
- [ ] ランキング機能
- [ ] アニメーション効果を追加

## ✅ チェックポイント

以下を確認してください：

- [ ] クイズアプリが動作する
- [ ] 質問が順番に表示される
- [ ] 正解/不正解の判定が正しい
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
</details>

### 質問 2
なぜ `currentQuestionIndex` が必要ですか？

<details>
<summary>答えを見る</summary>

配列 `quizData` から現在表示すべき質問を取得するためのインデックスです。この値を変更することで、次の質問に進むことができます。
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ 複数の State を組み合わせてアプリを作る
- ✅ 条件分岐でUIを切り替える
- ✅ 配列データを扱う
- ✅ イベント処理とState更新を組み合わせる

## おめでとうございます！ 🎉

React と TypeScript の基礎を学び、実際に動くアプリケーションを作成できました！

### 次のステップ
- より複雑な機能を追加してみる
- 他のアプリケーションを作ってみる
- React の公式ドキュメントでさらに学ぶ

---

💡 **ヒント**: このクイズアプリを自分なりにカスタマイズして、オリジナルのアプリを作ってみましょう！

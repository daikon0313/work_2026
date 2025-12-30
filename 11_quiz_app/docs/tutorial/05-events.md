# Step 5: イベント処理

ユーザーのクリック、入力、キーボード操作などに反応するイベント処理を学びます。

## 🎯 このステップで学ぶこと

- イベントハンドラの書き方
- 様々なイベントの種類
- イベントオブジェクトの使い方

## 📚 イベントとは？

イベントは、ユーザーの操作によって発生する「出来事」です。

**よくあるイベント**:
- クリック
- 入力
- フォーム送信
- キーボード操作
- マウスの動き

## ✍️ クリックイベントの基本

### 基本的な書き方

```tsx
function ClickButton(): JSX.Element {
  const handleClick = () => {
    alert('ボタンがクリックされました！')
  }

  return <button onClick={handleClick}>クリック</button>
}
```

**重要なポイント**:

```tsx
// ✅ 正しい（関数を渡す）
onClick={handleClick}

// ❌ 間違い（関数を実行してしまう）
onClick={handleClick()}
```

### インライン関数

```tsx
function InlineButton(): JSX.Element {
  return (
    <button onClick={() => alert('クリックされました！')}>
      クリック
    </button>
  )
}
```

## 🎨 様々なイベント

### 入力イベント

```tsx
import { useState } from 'react'

function InputExample(): JSX.Element {
  const [text, setText] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="入力してください"
      />
      <p>入力内容: {text}</p>
    </div>
  )
}
```

### フォーム送信

```tsx
import { useState } from 'react'

function FormExample(): JSX.Element {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()  // ページのリロードを防ぐ
    alert(`こんにちは、${name}さん！`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">送信</button>
    </form>
  )
}
```

### キーボードイベント

```tsx
import { useState } from 'react'

function KeyboardExample(): JSX.Element {
  const [key, setKey] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setKey(e.key)
    if (e.key === 'Enter') {
      alert('Enter キーが押されました！')
    }
  }

  return (
    <div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder="キーを押してください"
      />
      <p>押されたキー: {key}</p>
    </div>
  )
}
```

### マウスイベント

```tsx
import { useState } from 'react'

function MouseExample(): JSX.Element {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        width: '300px',
        height: '200px',
        border: '2px solid #ccc',
        padding: '20px'
      }}
    >
      <p>マウスを動かしてください</p>
      <p>X: {position.x}, Y: {position.y}</p>
    </div>
  )
}
```

## 🔧 イベントハンドラに引数を渡す

```tsx
function ButtonList(): JSX.Element {
  const handleClick = (id: number, name: string) => {
    alert(`ID: ${id}, Name: ${name}`)
  }

  return (
    <div>
      <button onClick={() => handleClick(1, '太郎')}>ユーザー1</button>
      <button onClick={() => handleClick(2, '花子')}>ユーザー2</button>
      <button onClick={() => handleClick(3, '次郎')}>ユーザー3</button>
    </div>
  )
}
```

## 📝 TypeScript の型定義

### 主なイベントの型

```tsx
// クリックイベント
onClick={(e: React.MouseEvent<HTMLButtonElement>) => {}}

// 入力変更
onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}}

// フォーム送信
onSubmit={(e: React.FormEvent<HTMLFormElement>) => {}}

// キーボード
onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {}}

// フォーカス
onFocus={(e: React.FocusEvent<HTMLInputElement>) => {}}
```

### 型を省略する方法

型推論が効く場合は省略できます：

```tsx
// 型を明示
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}

// 型推論（推奨）
<button onClick={(e) => console.log(e)}>クリック</button>
```

## 💪 練習問題

### 問題 1: カウンター（複数ボタン）

+1, +5, +10, リセット のボタンを持つカウンターを作成してください。

<details>
<summary>解答例を見る</summary>

```tsx
import { useState } from 'react'

function MultiCounter(): JSX.Element {
  const [count, setCount] = useState(0)

  const increment = (amount: number) => {
    setCount(prevCount => prevCount + amount)
  }

  const reset = () => {
    setCount(0)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>カウント: {count}</h2>
      <button onClick={() => increment(1)}>+1</button>
      <button onClick={() => increment(5)}>+5</button>
      <button onClick={() => increment(10)}>+10</button>
      <button onClick={reset}>リセット</button>
    </div>
  )
}

export default MultiCounter
```
</details>

### 問題 2: 入力フォーム

名前、メールアドレス、メッセージを入力し、送信すると内容を表示するフォームを作成してください。

<details>
<summary>解答例を見る</summary>

```tsx
import { useState } from 'react'

type FormData = {
  name: string
  email: string
  message: string
}

function ContactForm(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>送信内容</h2>
        <p>名前: {formData.name}</p>
        <p>メール: {formData.email}</p>
        <p>メッセージ: {formData.message}</p>
        <button onClick={() => setSubmitted(false)}>戻る</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          name="name"
          placeholder="名前"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <textarea
          name="message"
          placeholder="メッセージ"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>
      <button type="submit">送信</button>
    </form>
  )
}

export default ContactForm
```
</details>

## 📖 まとめ

- ✅ `onClick`, `onChange` などでイベントを処理
- ✅ イベントハンドラには関数を渡す（実行しない）
- ✅ `e.preventDefault()` でデフォルト動作を防ぐ
- ✅ TypeScript で型安全なイベント処理

## 次のステップ

[Step 6: リストのレンダリング](./06-lists.md) に進みましょう！

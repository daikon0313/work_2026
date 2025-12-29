# Step 4: State でデータを管理する

State（ステート）は、コンポーネントが持つ「記憶」です。ユーザーの操作によって変化するデータを管理します。

## 🎯 このステップで学ぶこと

- State とは何か
- useState フックの使い方
- State と Props の違い
- 複数の State の管理方法

## 📚 State とは？

State は、コンポーネントが「覚えておく」データです。

### 例：カウンター

ボタンをクリックすると数が増える → これには State が必要です。

```tsx
// State を使わない（動かない）
function Counter() {
  let count = 0  // これは動かない！

  function handleClick() {
    count = count + 1  // 変わるが、画面は更新されない
  }

  return <button onClick={handleClick}>count is {count}</button>
}

// State を使う（動く）
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)  // これが State！

  function handleClick() {
    setCount(count + 1)  // State を更新 → 画面も更新される
  }

  return <button onClick={handleClick}>count is {count}</button>
}
```

## ✍️ useState の基本

### Step 4-1: 最初の State

`src/components/Counter.tsx` を作成：

```tsx
import { useState } from 'react'

function Counter(): JSX.Element {
  // useState の構文
  const [count, setCount] = useState(0)
  //     ↑      ↑           ↑
  //   現在の値 更新関数    初期値

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  )
}

export default Counter
```

**構文の説明**

```tsx
const [count, setCount] = useState(0)
```

- `count`: 現在の State の値
- `setCount`: State を更新する関数
- `useState(0)`: 初期値は 0

**命名規則**
- State の名前: `count`, `name`, `isOpen` など
- 更新関数の名前: `set` + State名（`setCount`, `setName`, `setIsOpen`）

### Step 4-2: State を更新する

```tsx
import { useState } from 'react'

function Counter(): JSX.Element {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  )
}

export default Counter
```

## 🎨 様々な型の State

### 文字列の State

```tsx
import { useState } from 'react'

function NameInput(): JSX.Element {
  const [name, setName] = useState('')

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>こんにちは、{name}さん！</p>
    </div>
  )
}

export default NameInput
```

### 真偽値の State

```tsx
import { useState } from 'react'

function ToggleButton(): JSX.Element {
  const [isOn, setIsOn] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOn(!isOn)}>
        {isOn ? 'ON' : 'OFF'}
      </button>
      <p>状態: {isOn ? 'オン' : 'オフ'}</p>
    </div>
  )
}

export default ToggleButton
```

### オブジェクトの State

```tsx
import { useState } from 'react'

type User = {
  name: string
  age: number
}

function UserForm(): JSX.Element {
  const [user, setUser] = useState<User>({
    name: '',
    age: 0
  })

  return (
    <div>
      <input
        type="text"
        placeholder="名前"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="年齢"
        value={user.age}
        onChange={(e) => setUser({ ...user, age: Number(e.target.value) })}
      />
      <p>{user.name}さん、{user.age}歳</p>
    </div>
  )
}

export default UserForm
```

**重要**: オブジェクトを更新するときは、スプレッド演算子 `...` を使って新しいオブジェクトを作る

## 🔄 複数の State を管理する

1つのコンポーネントで複数の State を使えます：

```tsx
import { useState } from 'react'

function LoginForm(): JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = () => {
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Remember me:', rememberMe)
  }

  return (
    <div>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        ログイン状態を保持
      </label>
      <button onClick={handleSubmit}>ログイン</button>
    </div>
  )
}

export default LoginForm
```

## 🆚 State と Props の違い

| | State | Props |
|---|---|---|
| **定義** | コンポーネント内で管理 | 親から渡される |
| **変更** | ✅ 変更できる（setStateで） | ❌ 変更できない（読み取り専用） |
| **使い方** | 変化するデータ | 設定値、固定データ |
| **例** | カウント、入力値、開閉状態 | タイトル、色、サイズ |

```tsx
// Props: 親から受け取る（変更不可）
type GreetingProps = {
  name: string  // Props
}

function Greeting({ name }: GreetingProps): JSX.Element {
  // name は変更できない
  return <h1>Hello, {name}!</h1>
}

// State: 自分で管理（変更可能）
function Counter(): JSX.Element {
  const [count, setCount] = useState(0)  // State
  // count は setCount で変更できる

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 🎯 State 更新のベストプラクティス

### 1. 直接変更しない

```tsx
// ❌ 間違い
count = count + 1  // State を直接変更してはいけない

// ✅ 正しい
setCount(count + 1)  // 更新関数を使う
```

### 2. 前の値を使う場合は関数を渡す

```tsx
// 方法1: 値を直接渡す
setCount(count + 1)

// 方法2: 関数を渡す（推奨）
setCount(prevCount => prevCount + 1)
```

**なぜ関数を渡すべき？**
- 連続して更新する場合に確実に動作する
- 非同期更新でも安全

```tsx
// ❌ これは期待通りに動かない
setCount(count + 1)
setCount(count + 1)  // 2増えると思いきや、1しか増えない

// ✅ これは正しく動く
setCount(prevCount => prevCount + 1)
setCount(prevCount => prevCount + 1)  // 正しく2増える
```

### 3. オブジェクトは新しいものを作る

```tsx
// ❌ 間違い
user.name = "太郎"  // 直接変更
setUser(user)

// ✅ 正しい
setUser({ ...user, name: "太郎" })  // 新しいオブジェクトを作る
```

## 📝 TypeScript での型定義

```tsx
import { useState } from 'react'

// 型を明示的に指定
const [count, setCount] = useState<number>(0)
const [name, setName] = useState<string>('')
const [isOpen, setIsOpen] = useState<boolean>(false)

// 型を自動推論（推奨）
const [count, setCount] = useState(0)  // number と推論される
const [name, setName] = useState('')  // string と推論される

// オブジェクトの場合は型を指定
type User = {
  name: string
  age: number
}

const [user, setUser] = useState<User>({
  name: '',
  age: 0
})
```

## ✅ チェックポイント

以下を確認してください：

- [ ] useState の基本的な使い方を理解している
- [ ] State と Props の違いを理解している
- [ ] 様々な型の State を扱える
- [ ] State の更新ルールを理解している

## 🎓 理解度チェック

### 質問 1
以下のコードの問題点は何ですか？

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  function increment() {
    count = count + 1  // これは正しい？
  }

  return <button onClick={increment}>{count}</button>
}
```

<details>
<summary>答えを見る</summary>

State を直接変更してはいけません。必ず更新関数を使います：

```tsx
function increment() {
  setCount(count + 1)  // ✅ 正しい
}

// または
function increment() {
  setCount(prevCount => prevCount + 1)  // ✅ さらに良い
}
```
</details>

### 質問 2
State と Props の違いを説明してください。

<details>
<summary>答えを見る</summary>

- **State**: コンポーネント内で管理する変化するデータ。更新できる。
- **Props**: 親コンポーネントから渡される読み取り専用のデータ。更新できない。
</details>

## 💪 練習問題

### 問題 1: テキストエディタ

テキストエリアと文字数カウンターを作成してください。

**要件**:
- テキストを入力できる
- 文字数を表示する
- クリアボタンで内容を消せる

<details>
<summary>解答例を見る</summary>

`src/components/TextEditor.tsx`:
```tsx
import { useState } from 'react'

function TextEditor(): JSX.Element {
  const [text, setText] = useState('')

  const handleClear = () => {
    setText('')
  }

  return (
    <div style={{ padding: '20px' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: '100%', padding: '10px' }}
        placeholder="ここに入力してください"
      />
      <div style={{ marginTop: '10px' }}>
        <p>文字数: {text.length}</p>
        <button onClick={handleClear}>クリア</button>
      </div>
    </div>
  )
}

export default TextEditor
```
</details>

### 問題 2: Todo リスト（基本版）

タスクを追加・削除できる簡単な Todo リストを作成してください。

**要件**:
- 入力欄にタスクを入力できる
- 追加ボタンでリストに追加
- 削除ボタンでタスクを削除

<details>
<summary>解答例を見る</summary>

`src/components/TodoList.tsx`:
```tsx
import { useState } from 'react'

function TodoList(): JSX.Element {
  const [todos, setTodos] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      setTodos([...todos, inputValue])
      setInputValue('')
    }
  }

  const handleDelete = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index))
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Todo リスト</h2>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="タスクを入力"
        />
        <button onClick={handleAdd}>追加</button>
      </div>
      <ul style={{ marginTop: '20px' }}>
        {todos.map((todo, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            {todo}
            <button
              onClick={() => handleDelete(index)}
              style={{ marginLeft: '10px' }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList
```
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ State はコンポーネントの「記憶」
- ✅ useState で State を定義する
- ✅ State は更新関数でのみ変更できる
- ✅ Props は親から渡される読み取り専用のデータ
- ✅ State は親から子へは Props として渡す

## 次のステップ

State の基本が理解できたら、[Step 5: イベント処理](./05-events.md) に進みましょう！

---

💡 **ヒント**: State は「このコンポーネントが覚えておくべきこと」と考えましょう！

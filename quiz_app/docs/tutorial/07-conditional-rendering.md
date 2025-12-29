# Step 7: 条件付きレンダリング

条件によって表示内容を変える方法を学びます。

## 🎯 このステップで学ぶこと

- if 文を使った条件分岐
- 三項演算子
- && 演算子
- switch 文

## 📚 基本的な条件分岐

### if 文を使う方法

```tsx
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }): JSX.Element {
  if (isLoggedIn) {
    return <h1>おかえりなさい！</h1>
  }
  return <h1>ログインしてください</h1>
}
```

### 三項演算子

```tsx
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }): JSX.Element {
  return (
    <div>
      {isLoggedIn ? (
        <h1>おかえりなさい！</h1>
      ) : (
        <h1>ログインしてください</h1>
      )}
    </div>
  )
}
```

### && 演算子（条件が true のときだけ表示）

```tsx
function Notification({ count }: { count: number }): JSX.Element {
  return (
    <div>
      {count > 0 && <p>{count}件の新しいメッセージがあります</p>}
    </div>
  )
}
```

## 🎨 複雑な条件分岐

### 複数の条件

```tsx
type Status = 'loading' | 'success' | 'error'

function DataDisplay({ status }: { status: Status }): JSX.Element {
  if (status === 'loading') {
    return <p>読み込み中...</p>
  }

  if (status === 'error') {
    return <p>エラーが発生しました</p>
  }

  return <p>データを表示</p>
}
```

### switch 文

```tsx
type Status = 'loading' | 'success' | 'error'

function DataDisplay({ status }: { status: Status }): JSX.Element {
  switch (status) {
    case 'loading':
      return <p>読み込み中...</p>
    case 'error':
      return <p>エラーが発生しました</p>
    case 'success':
      return <p>成功しました</p>
    default:
      return <p>不明な状態です</p>
  }
}
```

## 💪 練習問題

年齢によってメッセージを変えるコンポーネントを作成してください。

<details>
<summary>解答例を見る</summary>

```tsx
function AgeMessage({ age }: { age: number }): JSX.Element {
  return (
    <div>
      {age < 18 && <p>未成年です</p>}
      {age >= 18 && age < 60 && <p>成人です</p>}
      {age >= 60 && <p>シニアです</p>}
    </div>
  )
}

export default AgeMessage
```
</details>

## 📖 まとめ

- ✅ if 文、三項演算子、&& 演算子を使い分ける
- ✅ 複雑な条件は switch 文も検討
- ✅ 条件によって表示を変えられる

## 次のステップ

基礎が身についたら、[Step 11: クイズアプリの基礎](./11-quiz-app-basics.md) で実際のアプリを作りましょう！

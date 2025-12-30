# Step 2: JSX の書き方

JSX（JavaScript XML）は、JavaScript の中に HTML のような記法を書ける構文です。

## 🎯 このステップで学ぶこと

- JSX とは何か
- JSX の基本的な書き方
- JavaScript と JSX を組み合わせる方法
- JSX のルールと制約

## 📚 JSX とは？

JSX は、React で UI を記述するための構文です。

```tsx
// これが JSX
const element = <h1>Hello, world!</h1>
```

**特徴**
- HTML に似ているが、JavaScript のコード
- 最終的には JavaScript に変換される
- TypeScript と組み合わせて型安全に書ける

## ✍️ JSX の基本

### 基本的な要素

```tsx
function BasicJSX(): JSX.Element {
  return (
    <div>
      <h1>見出し</h1>
      <p>段落のテキスト</p>
      <button>ボタン</button>
    </div>
  )
}
```

### ルール 1: 単一のルート要素

**❌ 間違い**: 複数のルート要素

```tsx
function WrongComponent() {
  return (
    <h1>タイトル</h1>
    <p>テキスト</p>  // エラー！
  )
}
```

**✅ 正しい**: 1つの要素で囲む

```tsx
function CorrectComponent() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>テキスト</p>
    </div>
  )
}
```

**💡 Fragment を使う方法**

余分な `<div>` を作りたくない場合：

```tsx
function ComponentWithFragment() {
  return (
    <>
      <h1>タイトル</h1>
      <p>テキスト</p>
    </>
  )
}
```

`<>` と `</>` は Fragment（フラグメント）と呼ばれ、DOM に余分な要素を追加しません。

### ルール 2: すべてのタグを閉じる

**❌ 間違い**:

```tsx
<img src="image.jpg">
<input type="text">
```

**✅ 正しい**:

```tsx
<img src="image.jpg" />
<input type="text" />
```

自己終了タグを使用します。

### ルール 3: camelCase を使う

HTML 属性は camelCase で書きます。

**HTML**:
```html
<div class="container" onclick="handleClick()">
```

**JSX**:
```tsx
<div className="container" onClick={handleClick}>
```

主な違い：
- `class` → `className`
- `onclick` → `onClick`
- `for` → `htmlFor`
- `tabindex` → `tabIndex`

## 🔀 JavaScript を埋め込む

### 波括弧 `{}` を使う

JSX の中で JavaScript を使うには、`{}` で囲みます。

```tsx
function JavaScriptInJSX(): JSX.Element {
  const name = "太郎"
  const age = 25

  return (
    <div>
      <h1>こんにちは、{name}さん！</h1>
      <p>年齢: {age}歳</p>
      <p>来年は{age + 1}歳です</p>
    </div>
  )
}
```

### 式を埋め込む

任意の JavaScript の式を埋め込めます：

```tsx
function Expressions(): JSX.Element {
  const user = {
    firstName: "太郎",
    lastName: "山田"
  }

  return (
    <div>
      <h1>{user.lastName} {user.firstName}</h1>
      <p>{2 + 2}</p>
      <p>{new Date().toLocaleDateString()}</p>
      <p>{"Hello".toUpperCase()}</p>
    </div>
  )
}
```

### 属性に JavaScript を使う

```tsx
function AttributesExample(): JSX.Element {
  const imageUrl = "https://via.placeholder.com/150"
  const imageAlt = "プレースホルダー画像"

  return (
    <div>
      <img src={imageUrl} alt={imageAlt} />
      <input type="text" placeholder={`名前を入力してください`} />
    </div>
  )
}
```

## 🎨 スタイルの適用

### 方法1: className を使う

```tsx
// App.css に定義
// .title { color: blue; font-size: 24px; }

function StyledWithClass(): JSX.Element {
  return <h1 className="title">スタイル付きタイトル</h1>
}
```

### 方法2: インラインスタイル

```tsx
function StyledInline(): JSX.Element {
  const titleStyle = {
    color: 'blue',
    fontSize: '24px',
    fontWeight: 'bold'
  }

  return (
    <div>
      <h1 style={titleStyle}>スタイル付きタイトル</h1>
      <p style={{ color: 'red', marginTop: '10px' }}>赤いテキスト</p>
    </div>
  )
}
```

**ポイント**
- スタイルはオブジェクトとして定義
- プロパティ名は camelCase（`font-size` → `fontSize`）
- 値は文字列（`'24px'`）

## 📝 TypeScript の型定義

### コンポーネントの型

```tsx
function TypedComponent(): JSX.Element {
  return <h1>型定義されたコンポーネント</h1>
}
```

### 変数の型

```tsx
function TypedVariables(): JSX.Element {
  const name: string = "太郎"
  const age: number = 25
  const isStudent: boolean = true

  return (
    <div>
      <p>名前: {name}</p>
      <p>年齢: {age}</p>
      <p>学生: {isStudent ? 'はい' : 'いいえ'}</p>
    </div>
  )
}
```

## ✅ チェックポイント

以下を確認してください：

- [ ] JSX の基本的な構文が理解できる
- [ ] 単一のルート要素のルールを理解している
- [ ] `{}` を使って JavaScript を埋め込める
- [ ] className と onClick などの camelCase を理解している
- [ ] スタイルを適用できる

## 🎓 理解度チェック

### 質問 1
以下のコードの問題点を見つけてください：

```tsx
function Problem() {
  return (
    <h1>タイトル</h1>
    <p>本文</p>
  )
}
```

<details>
<summary>答えを見る</summary>

複数のルート要素がある。1つの要素で囲む必要があります：

```tsx
function Solution() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>本文</p>
    </div>
  )
}
```

または Fragment を使う：

```tsx
function Solution() {
  return (
    <>
      <h1>タイトル</h1>
      <p>本文</p>
    </>
  )
}
```
</details>

### 質問 2
以下のコードを JSX で正しく書いてください：

HTML:
```html
<div class="container">
  <img src="photo.jpg">
  <input type="text" value="テスト">
</div>
```

<details>
<summary>答えを見る</summary>

```tsx
<div className="container">
  <img src="photo.jpg" />
  <input type="text" value="テスト" />
</div>
```

変更点：
- `class` → `className`
- タグを閉じる（`<img />`, `<input />`）
</details>

## 💪 練習問題

以下のコンポーネントを作成してください：

### 問題 1: ユーザーカード

名前、年齢、メールアドレスを表示するカードコンポーネント

<details>
<summary>解答例を見る</summary>

`src/components/UserCard.tsx`:
```tsx
function UserCard(): JSX.Element {
  const user = {
    name: "山田太郎",
    age: 28,
    email: "taro@example.com",
    avatar: "https://via.placeholder.com/100"
  }

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '300px',
    textAlign: 'center' as const
  }

  return (
    <div style={cardStyle}>
      <img
        src={user.avatar}
        alt={user.name}
        style={{ borderRadius: '50%' }}
      />
      <h2>{user.name}</h2>
      <p>年齢: {user.age}歳</p>
      <p>メール: {user.email}</p>
    </div>
  )
}

export default UserCard
```
</details>

### 問題 2: 計算機

2つの数値を足し算して表示するコンポーネント

<details>
<summary>解答例を見る</summary>

`src/components/Calculator.tsx`:
```tsx
function Calculator(): JSX.Element {
  const num1: number = 10
  const num2: number = 20
  const result: number = num1 + num2

  return (
    <div style={{ padding: '20px', border: '2px solid #333' }}>
      <h2>簡単な計算機</h2>
      <p>{num1} + {num2} = {result}</p>
      <p>2倍すると: {result * 2}</p>
      <p>半分にすると: {result / 2}</p>
    </div>
  )
}

export default Calculator
```
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ JSX は JavaScript の中に HTML のような記法を書ける
- ✅ 必ず単一のルート要素で囲む
- ✅ すべてのタグを閉じる
- ✅ 属性は camelCase で書く
- ✅ `{}` で JavaScript を埋め込む
- ✅ スタイルは `className` またはインラインスタイルで適用

## 次のステップ

JSX の基本が理解できたら、[Step 3: Props でデータを渡す](./03-props.md) に進みましょう！

---

💡 **ヒント**: JSX は見た目は HTML ですが、実際は JavaScript です。エラーメッセージをよく読んで理解しましょう！

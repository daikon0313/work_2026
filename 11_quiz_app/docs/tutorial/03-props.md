# Step 3: Props でデータを渡す

Props（プロップス）は、親コンポーネントから子コンポーネントにデータを渡す仕組みです。

## 🎯 このステップで学ぶこと

- Props とは何か
- Props の使い方
- TypeScript で型安全な Props を定義する方法
- デフォルト値の設定方法

## 📚 Props とは？

Props は "properties"（プロパティ）の略で、コンポーネントに渡すデータのことです。

### 例：関数の引数のようなもの

```tsx
// 通常の関数
function greet(name: string) {
  return `こんにちは、${name}さん！`
}

greet("太郎")  // 引数を渡す

// React コンポーネント
function Greeting(props: { name: string }) {
  return <h1>こんにちは、{props.name}さん！</h1>
}

<Greeting name="太郎" />  // Props を渡す
```

## ✍️ Props の基本的な使い方

### Step 3-1: 最初の Props

`src/components/Greeting.tsx` を作成：

```tsx
// Props の型を定義
type GreetingProps = {
  name: string
}

function Greeting(props: GreetingProps): JSX.Element {
  return <h1>こんにちは、{props.name}さん！</h1>
}

export default Greeting
```

### Step 3-2: Props を渡す

`src/App.tsx` で使用：

```tsx
import Greeting from './components/Greeting'

function App() {
  return (
    <div>
      <Greeting name="太郎" />
      <Greeting name="花子" />
      <Greeting name="次郎" />
    </div>
  )
}

export default App
```

**ポイント**
- 同じコンポーネントを、異なるデータで再利用できる
- `name="太郎"` のように、HTML の属性のように書く

### Step 3-3: 分割代入を使う

Props は分割代入で受け取ると便利です：

```tsx
type GreetingProps = {
  name: string
}

// props.name の代わりに、直接 name を使える
function Greeting({ name }: GreetingProps): JSX.Element {
  return <h1>こんにちは、{name}さん！</h1>
}

export default Greeting
```

## 🎨 複数の Props を渡す

### ユーザーカードを作ろう

`src/components/UserCard.tsx`:

```tsx
type UserCardProps = {
  name: string
  age: number
  email: string
  avatar: string
}

function UserCard({ name, age, email, avatar }: UserCardProps): JSX.Element {
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '300px',
    margin: '10px'
  }

  return (
    <div style={cardStyle}>
      <img
        src={avatar}
        alt={name}
        style={{ width: '100px', borderRadius: '50%' }}
      />
      <h2>{name}</h2>
      <p>年齢: {age}歳</p>
      <p>メール: {email}</p>
    </div>
  )
}

export default UserCard
```

`src/App.tsx` で使用：

```tsx
import UserCard from './components/UserCard'

function App() {
  return (
    <div>
      <UserCard
        name="山田太郎"
        age={28}
        email="taro@example.com"
        avatar="https://via.placeholder.com/100"
      />
      <UserCard
        name="佐藤花子"
        age={25}
        email="hanako@example.com"
        avatar="https://via.placeholder.com/100/ff69b4"
      />
    </div>
  )
}

export default App
```

**注意**
- 文字列は `name="太郎"` のようにダブルクォートで囲む
- 数値は `age={28}` のように波括弧で囲む

## 🔧 オプショナルな Props

必須ではない Props を定義する方法：

```tsx
type ButtonProps = {
  label: string
  color?: string  // ? を付けるとオプショナル
  onClick?: () => void
}

function Button({ label, color, onClick }: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color || 'blue', color: 'white', padding: '10px 20px' }}
    >
      {label}
    </button>
  )
}

export default Button
```

使用例：

```tsx
<Button label="クリック" />  {/* color を省略 */}
<Button label="クリック" color="red" />
<Button label="クリック" color="green" onClick={() => alert('clicked!')} />
```

## 🎯 デフォルト値を設定する

### 方法 1: デフォルトパラメータ

```tsx
type ButtonProps = {
  label: string
  color?: string
}

function Button({ label, color = 'blue' }: ButtonProps): JSX.Element {
  return (
    <button style={{ backgroundColor: color, color: 'white', padding: '10px 20px' }}>
      {label}
    </button>
  )
}
```

### 方法 2: defaultProps（古い方法）

```tsx
type ButtonProps = {
  label: string
  color: string
}

function Button({ label, color }: ButtonProps): JSX.Element {
  return (
    <button style={{ backgroundColor: color, color: 'white', padding: '10px 20px' }}>
      {label}
    </button>
  )
}

Button.defaultProps = {
  color: 'blue'
}
```

**推奨**: デフォルトパラメータの方がシンプルで TypeScript と相性が良い

## 🔀 children Props

子要素を受け取る特別な Props：

```tsx
type CardProps = {
  title: string
  children: React.ReactNode  // 子要素
}

function Card({ title, children }: CardProps): JSX.Element {
  return (
    <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

export default Card
```

使用例：

```tsx
<Card title="プロフィール">
  <p>名前: 太郎</p>
  <p>年齢: 25歳</p>
  <button>詳細を見る</button>
</Card>
```

## 📝 TypeScript の型定義のベストプラクティス

### type vs interface

```tsx
// type を使う方法
type UserProps = {
  name: string
  age: number
}

// interface を使う方法
interface UserProps {
  name: string
  age: number
}
```

**どちらを使うべき？**
- 基本的にはどちらでもOK
- React では `type` がよく使われる
- `interface` は拡張性に優れている

### Props の型定義の場所

```tsx
// 方法1: 同じファイルに定義
type ButtonProps = {
  label: string
}

function Button({ label }: ButtonProps): JSX.Element {
  // ...
}

// 方法2: 別ファイルに定義（大規模プロジェクト向け）
// src/types/Button.ts
export type ButtonProps = {
  label: string
}

// src/components/Button.tsx
import { ButtonProps } from '../types/Button'
```

## ✅ チェックポイント

以下を確認してください：

- [ ] Props の基本的な使い方を理解している
- [ ] TypeScript で Props の型を定義できる
- [ ] オプショナルな Props を定義できる
- [ ] デフォルト値を設定できる
- [ ] children Props を使える

## 🎓 理解度チェック

### 質問 1
以下のコンポーネントを使うとき、正しい使い方はどれですか？

```tsx
type ProductProps = {
  name: string
  price: number
}

function Product({ name, price }: ProductProps): JSX.Element {
  return <div>{name}: {price}円</div>
}
```

A. `<Product name="りんご" price="100" />`
B. `<Product name="りんご" price={100} />`
C. `<Product name={りんご} price={100} />`

<details>
<summary>答えを見る</summary>

**B. `<Product name="りんご" price={100} />`**

- 文字列は `"りんご"` のようにクォートで囲む
- 数値は `{100}` のように波括弧で囲む
</details>

### 質問 2
オプショナルな Props を定義するには？

<details>
<summary>答えを見る</summary>

`?` を使います：

```tsx
type ComponentProps = {
  required: string     // 必須
  optional?: string    // オプショナル
}
```
</details>

## 💪 練習問題

### 問題 1: 記事カードコンポーネント

ブログ記事を表示するカードコンポーネントを作成してください。

**要件**:
- タイトル、著者、公開日、内容を Props で受け取る
- タグ（配列）もオプショナルで受け取る

<details>
<summary>解答例を見る</summary>

`src/components/ArticleCard.tsx`:
```tsx
type ArticleCardProps = {
  title: string
  author: string
  publishedDate: string
  content: string
  tags?: string[]
}

function ArticleCard({
  title,
  author,
  publishedDate,
  content,
  tags = []
}: ArticleCardProps): JSX.Element {
  return (
    <article style={{
      border: '1px solid #ddd',
      padding: '20px',
      margin: '10px 0',
      borderRadius: '8px'
    }}>
      <h2>{title}</h2>
      <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
        <span>著者: {author}</span> | <span>{publishedDate}</span>
      </div>
      <p>{content}</p>
      {tags.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          {tags.map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#e0e0e0',
                padding: '4px 8px',
                borderRadius: '4px',
                marginRight: '5px',
                fontSize: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export default ArticleCard
```

使用例：
```tsx
<ArticleCard
  title="React を学ぼう"
  author="山田太郎"
  publishedDate="2026-01-15"
  content="React は素晴らしいライブラリです..."
  tags={['React', 'JavaScript', 'Web開発']}
/>
```
</details>

### 問題 2: 汎用ボタンコンポーネント

様々なスタイルのボタンを作れるコンポーネントを作成してください。

**要件**:
- ラベル（必須）
- サイズ: small, medium, large（オプショナル、デフォルトは medium）
- バリアント: primary, secondary, danger（オプショナル、デフォルトは primary）
- クリックハンドラ（オプショナル）

<details>
<summary>解答例を見る</summary>

`src/components/CustomButton.tsx`:
```tsx
type ButtonSize = 'small' | 'medium' | 'large'
type ButtonVariant = 'primary' | 'secondary' | 'danger'

type CustomButtonProps = {
  label: string
  size?: ButtonSize
  variant?: ButtonVariant
  onClick?: () => void
}

function CustomButton({
  label,
  size = 'medium',
  variant = 'primary',
  onClick
}: CustomButtonProps): JSX.Element {
  const sizeStyles = {
    small: { padding: '5px 10px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '15px 30px', fontSize: '16px' }
  }

  const variantStyles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' },
    danger: { backgroundColor: '#dc3545', color: 'white' }
  }

  const buttonStyle = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }

  return (
    <button style={buttonStyle} onClick={onClick}>
      {label}
    </button>
  )
}

export default CustomButton
```

使用例：
```tsx
<CustomButton label="クリック" />
<CustomButton label="小さいボタン" size="small" variant="secondary" />
<CustomButton label="削除" size="large" variant="danger" onClick={() => alert('削除')} />
```
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ Props はコンポーネントに渡すデータ
- ✅ TypeScript で型を定義して型安全に
- ✅ 分割代入で Props を受け取る
- ✅ `?` でオプショナルな Props を定義
- ✅ デフォルト値を設定できる
- ✅ children Props で子要素を受け取る

## 次のステップ

Props の基本が理解できたら、[Step 4: State でデータを管理する](./04-state.md) に進みましょう！

---

💡 **ヒント**: Props は「読み取り専用」です。コンポーネント内で Props を変更してはいけません！

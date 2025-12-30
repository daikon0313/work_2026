# Step 1: コンポーネントの作成

React の最も基本的な概念である「コンポーネント」について学びます。

## 🎯 このステップで学ぶこと

- コンポーネントとは何か
- コンポーネントの作り方
- コンポーネントの使い方

## 📚 コンポーネントとは？

コンポーネントは、**UI の部品**です。ボタン、カード、ヘッダーなど、画面を構成する要素を部品として作ります。

### 例：レゴブロック

レゴブロックを組み合わせて大きな作品を作るように、コンポーネントを組み合わせてアプリケーションを作ります。

```
小さなコンポーネント → 組み合わせる → 大きなアプリケーション
```

## ✍️ 最初のコンポーネントを作ろう

### Step 1-1: ファイルを作成

`src/components` フォルダを作り、`Greeting.tsx` ファイルを作成します。

```bash
mkdir -p src/components
```

### Step 1-2: コンポーネントを書く

`src/components/Greeting.tsx` に以下のコードを書きます：

```tsx
function Greeting() {
  return <h1>こんにちは、React！</h1>
}

export default Greeting
```

**コードの説明**

1. `function Greeting()`: コンポーネントは関数として定義します
   - **重要**: 名前は必ず大文字で始める（`greeting` ではなく `Greeting`）

2. `return`: 画面に表示する内容を返します

3. `<h1>こんにちは、React！</h1>`: これが JSX（後で詳しく学びます）

4. `export default Greeting`: 他のファイルから使えるようにエクスポート

### Step 1-3: コンポーネントを使う

`src/App.tsx` を開いて、以下のように書き換えます：

```tsx
import Greeting from './components/Greeting'
import './App.css'

function App() {
  return (
    <div>
      <Greeting />
    </div>
  )
}

export default App
```

**コードの説明**

1. `import Greeting from './components/Greeting'`:
   - 作成したコンポーネントをインポート

2. `<Greeting />`:
   - コンポーネントを使用（HTML タグのように書く）

### Step 1-4: 確認

ブラウザで確認すると、「こんにちは、React！」と表示されます。

## 🔄 複数のコンポーネントを作ろう

### 練習問題 1: Profile コンポーネント

自己紹介を表示するコンポーネントを作りましょう。

`src/components/Profile.tsx` を作成：

```tsx
function Profile() {
  return (
    <div>
      <h2>プロフィール</h2>
      <p>名前: 太郎</p>
      <p>年齢: 25歳</p>
      <p>趣味: プログラミング</p>
    </div>
  )
}

export default Profile
```

`src/App.tsx` で使用：

```tsx
import Greeting from './components/Greeting'
import Profile from './components/Profile'
import './App.css'

function App() {
  return (
    <div>
      <Greeting />
      <Profile />
    </div>
  )
}

export default App
```

## 🎨 コンポーネントのネスト（入れ子）

コンポーネントの中で別のコンポーネントを使うことができます。

### 例: Card コンポーネント

`src/components/Card.tsx`：

```tsx
import Profile from './Profile'

function Card() {
  return (
    <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h1>カード</h1>
      <Profile />
    </div>
  )
}

export default Card
```

`src/App.tsx`：

```tsx
import Card from './components/Card'
import './App.css'

function App() {
  return (
    <div>
      <Card />
    </div>
  )
}

export default App
```

これで、Card の中に Profile が表示されます！

## 📝 TypeScript の型を追加しよう

TypeScript では、関数の戻り値の型を指定できます。

```tsx
function Greeting(): JSX.Element {
  return <h1>こんにちは、React！</h1>
}

export default Greeting
```

- `(): JSX.Element`: この関数は JSX 要素を返すという意味
- 型を指定することで、間違いを防げます

## ✅ チェックポイント

以下を確認してください：

- [ ] コンポーネントを作成できる
- [ ] コンポーネントをインポートして使用できる
- [ ] 複数のコンポーネントを組み合わせて使える
- [ ] コンポーネントをネストできる

## 🎓 理解度チェック

### 質問 1
以下のコードの間違いを見つけてください：

```tsx
function greeting() {
  return <h1>Hello</h1>
}
```

<details>
<summary>答えを見る</summary>

コンポーネント名が小文字で始まっている。正しくは `Greeting` のように大文字で始める必要があります。

```tsx
function Greeting() {
  return <h1>Hello</h1>
}
```
</details>

### 質問 2
コンポーネントを使うときの正しい書き方はどれですか？

A. `<Greeting></Greeting>`
B. `<Greeting />`
C. 両方正しい

<details>
<summary>答えを見る</summary>

**C. 両方正しい**

- 子要素がない場合: `<Greeting />` （自己終了タグ）
- 子要素がある場合: `<Greeting>子要素</Greeting>`
</details>

## 💪 練習問題

以下のコンポーネントを作ってみましょう：

1. **Header コンポーネント**
   - サイトのタイトルを表示
   - ナビゲーションリンクを表示

2. **Footer コンポーネント**
   - コピーライト情報を表示

3. **App コンポーネントで組み合わせる**
   - Header、中身、Footer の順で表示

<details>
<summary>解答例を見る</summary>

`src/components/Header.tsx`：
```tsx
function Header(): JSX.Element {
  return (
    <header style={{ backgroundColor: '#333', color: 'white', padding: '20px' }}>
      <h1>My Website</h1>
      <nav>
        <a href="/" style={{ color: 'white', margin: '0 10px' }}>Home</a>
        <a href="/about" style={{ color: 'white', margin: '0 10px' }}>About</a>
      </nav>
    </header>
  )
}

export default Header
```

`src/components/Footer.tsx`：
```tsx
function Footer(): JSX.Element {
  return (
    <footer style={{ backgroundColor: '#333', color: 'white', padding: '20px', marginTop: '50px' }}>
      <p>&copy; 2026 My Website. All rights reserved.</p>
    </footer>
  )
}

export default Footer
```

`src/App.tsx`：
```tsx
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div>
      <Header />
      <main style={{ padding: '20px', minHeight: '400px' }}>
        <h2>Welcome!</h2>
        <p>This is the main content area.</p>
      </main>
      <Footer />
    </div>
  )
}

export default App
```
</details>

## 📖 まとめ

このステップで学んだこと：

- ✅ コンポーネントは関数として定義する
- ✅ コンポーネント名は大文字で始める
- ✅ `export default` でエクスポートする
- ✅ `import` でインポートする
- ✅ `<コンポーネント名 />` で使用する
- ✅ コンポーネントはネストできる

## 次のステップ

コンポーネントの基本が理解できたら、[Step 2: JSX の書き方](./02-jsx-basics.md) に進みましょう！

---

💡 **ヒント**: コンポーネントは小さく、再利用可能に作るのがポイントです！

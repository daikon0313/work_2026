# Step 6: リストのレンダリング

配列のデータを画面に表示する方法を学びます。

## 🎯 このステップで学ぶこと

- `map()` を使ったリストのレンダリング
- `key` 属性の重要性
- フィルタリングとソート

## 📚 map() でリストを表示

### 基本的な使い方

```tsx
function FruitList(): JSX.Element {
  const fruits = ['りんご', 'バナナ', 'オレンジ']

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  )
}
```

**重要**: `key` 属性を必ず指定する！

## 🔑 key 属性の重要性

### なぜ key が必要？

React が要素を識別し、効率的に更新するために必要です。

```tsx
// ❌ key がない（警告が出る）
{fruits.map(fruit => <li>{fruit}</li>)}

// ✅ index を key にする（最終手段）
{fruits.map((fruit, index) => <li key={index}>{fruit}</li>)}

// ✅ ユニークな ID を key にする（推奨）
{users.map(user => <li key={user.id}>{user.name}</li>)}
```

### key の選び方

1. **データに ID がある場合**: ID を使う（推奨）
2. **データに ID がない場合**: ユニークな値を使う
3. **最終手段**: index を使う（並び替えがない場合のみ）

## 🎨 オブジェクトの配列をレンダリング

```tsx
type User = {
  id: number
  name: string
  email: string
}

function UserList(): JSX.Element {
  const users: User[] = [
    { id: 1, name: '太郎', email: 'taro@example.com' },
    { id: 2, name: '花子', email: 'hanako@example.com' },
    { id: 3, name: '次郎', email: 'jiro@example.com' }
  ]

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  )
}
```

## 🔍 フィルタリングとソート

### フィルタリング

```tsx
import { useState } from 'react'

type Todo = {
  id: number
  text: string
  completed: boolean
}

function TodoList(): JSX.Element {
  const [todos] = useState<Todo[]>([
    { id: 1, text: '買い物', completed: true },
    { id: 2, text: '勉強', completed: false },
    { id: 3, text: '運動', completed: false }
  ])

  const activeTodos = todos.filter(todo => !todo.completed)

  return (
    <div>
      <h2>未完了のタスク</h2>
      <ul>
        {activeTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

### ソート

```tsx
function SortedList(): JSX.Element {
  const numbers = [5, 2, 8, 1, 9]
  const sorted = [...numbers].sort((a, b) => a - b)

  return (
    <ul>
      {sorted.map((num, index) => (
        <li key={index}>{num}</li>
      ))}
    </ul>
  )
}
```

## 💪 練習問題

製品リストを作成し、価格でフィルタリングできるようにしてください。

<details>
<summary>解答例を見る</summary>

```tsx
import { useState } from 'react'

type Product = {
  id: number
  name: string
  price: number
  category: string
}

function ProductList(): JSX.Element {
  const products: Product[] = [
    { id: 1, name: 'ノートPC', price: 100000, category: '電子機器' },
    { id: 2, name: 'マウス', price: 3000, category: '電子機器' },
    { id: 3, name: '本', price: 1500, category: '書籍' },
    { id: 4, name: 'ペン', price: 500, category: '文房具' }
  ]

  const [maxPrice, setMaxPrice] = useState(100000)

  const filteredProducts = products.filter(p => p.price <= maxPrice)

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <label>
          最大価格: {maxPrice}円
          <input
            type="range"
            min="0"
            max="100000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </label>
      </div>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id}>
            {product.name} - {product.price}円 ({product.category})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProductList
```
</details>

## 📖 まとめ

- ✅ `map()` でリストをレンダリング
- ✅ `key` 属性は必須
- ✅ `filter()` でフィルタリング
- ✅ `sort()` でソート

## 次のステップ

[Step 7: 条件付きレンダリング](./07-conditional-rendering.md) に進みましょう！

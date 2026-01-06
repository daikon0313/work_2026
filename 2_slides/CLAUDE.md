# 2_slides - プレゼンテーション資料

Marpを使用してMarkdownからスライドを生成するプロジェクトです。

## プロジェクト概要

MarpはMarkdownでプレゼンテーションスライドを作成できるツールです。このディレクトリでは、技術プレゼンテーションや発表資料を管理します。

## 技術スタック

- **Marp CLI**: Markdownからスライドを生成
- **出力形式**: HTML, PDF
- **テーマ**: カスタムCSSテーマ対応

## ディレクトリ構成

```
2_slides/
├── README.md                  # プロジェクト説明
├── create-presentation.sh     # スライド作成スクリプト
├── _templates/                # スライドテンプレート
├── themes/                    # カスタムテーマ
└── [プレゼン名]/              # 各プレゼンテーション
```

## 使い方

### 新しいプレゼンテーションの作成

```bash
cd 2_slides
./create-presentation.sh
```

対話形式でプレゼンテーション名を入力すると、テンプレートから新しいスライドが作成されます。

### スライドのプレビュー

```bash
# ルートディレクトリから
npm run slides:preview

# または直接Marpを使用
cd 2_slides
marp -w -s ./
```

ブラウザでライブプレビューが表示され、ファイルを編集すると自動的に更新されます。

### ビルド

#### HTML形式で出力

```bash
npm run slides:build:html
```

#### PDF形式で出力

```bash
npm run slides:build:pdf
```

#### 両方を出力

```bash
npm run slides:build
```

## Marp記法の基本

### スライド区切り

```markdown
---
```

3つのハイフンでスライドを区切ります。

### フロントマター

```markdown
---
marp: true
theme: default
paginate: true
---
```

### 2カラムレイアウト

```markdown
<div class="columns">
<div>

左側のコンテンツ

</div>
<div>

右側のコンテンツ

</div>
</div>
```

### コードブロック

````markdown
```python
def hello():
    print("Hello, World!")
```
````

### 画像

```markdown
![bg](image.jpg)           # 背景画像
![width:500px](image.jpg)  # サイズ指定
```

## テンプレート

### 基本テンプレート

```markdown
---
marp: true
theme: default
paginate: true
---

# タイトル

副題

---

## アジェンダ

1. イントロダクション
2. 本題
3. まとめ

---

## スライド1

内容

---

## まとめ

- ポイント1
- ポイント2
```

## カスタムテーマ

`themes/` ディレクトリにCSSファイルを配置してカスタムテーマを作成できます。

```css
/* themes/custom.css */
section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

使用方法：

```markdown
---
marp: true
theme: custom
---
```

## ベストプラクティス

### スライド設計

1. **1スライド1メッセージ**
   - 詰め込みすぎない
   - 重要なポイントに絞る

2. **視覚的な工夫**
   - 図表を活用
   - コードは最小限に
   - 色使いに注意

3. **フォント**
   - 読みやすいサイズ
   - 行間を適切に

### ファイル管理

```
2_slides/
├── 2026-01-15_技術発表/
│   ├── slides.md
│   ├── images/
│   └── README.md
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run slides:preview` | ライブプレビュー |
| `npm run slides:build` | ビルド（HTML/PDF） |
| `npm run slides:build:html` | HTML出力 |
| `npm run slides:build:pdf` | PDF出力 |

## トラブルシューティング

### プレビューが表示されない

1. Marp CLIがインストールされているか確認
2. ポートが使用されていないか確認
3. ファイルパスが正しいか確認

### PDF生成でエラー

Chromiumが必要です：

```bash
npm install -g @marp-team/marp-cli
```

## 参考リンク

- [Marp公式ドキュメント](https://marp.app/)
- [Marp CLI GitHub](https://github.com/marp-team/marp-cli)
- [README.md](./README.md) - 詳細な使い方

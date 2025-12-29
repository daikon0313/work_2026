# 登壇資料・プレゼンテーション

このディレクトリには、2026年の登壇資料やプレゼンテーションを管理します。

## セットアップ

### 1. Marp CLIのインストール

```bash
npm install -g @marp-team/marp-cli
```

または、プロジェクトローカルにインストール:

```bash
npm install --save-dev @marp-team/marp-cli
```

### 2. VS Code拡張機能（推奨）

VS Codeを使用している場合、[Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)拡張機能をインストールすると、リアルタイムプレビューが可能になります。

## クイックスタート

### 新しいプレゼンテーションを作成

スクリプトを使って、プレゼンテーション用のディレクトリを簡単に作成できます：

```bash
cd slides
./create-presentation.sh "登壇タイトル"
```

例：
```bash
./create-presentation.sh "Introduction to Marp"
./create-presentation.sh "2026年の目標発表"
```

このコマンドで以下が自動的に作成されます：
- `YYYY-MM-DD-タイトル/` ディレクトリ
- `presentation.md` テンプレートファイル
- `images/` 画像格納用ディレクトリ
- `assets/` その他アセット用ディレクトリ
- `README.md` プレゼンテーション用のREADME

### プレゼンテーションの編集

```bash
cd YYYY-MM-DD-your-presentation
code presentation.md  # または好きなエディタで編集
```

### プレビュー・出力

```bash
# プレビュー（ウォッチモード）
marp -w presentation.md

# HTMLに変換
marp presentation.md -o output.html

# PDFに変換
marp presentation.md -o output.pdf
```

## テーマの使い方

### Casualテーマ（デフォルト）

カジュアルでモダンなグラデーション背景のテーマ。

```markdown
---
marp: true
style: |
  @import url('themes/casual.css');
---
```

### スライドタイプ

#### タイトルスライド
```markdown
<!-- _class: title -->
# タイトル
```

#### セクション区切り
```markdown
<!-- _class: section-divider -->
# セクション名
```

#### ライトテーマスライド
```markdown
<!-- _class: light -->
## 白背景のスライド
```

## レイアウト機能

### 2カラムレイアウト

```markdown
<div class="columns">

### 左カラム
内容

### 右カラム
内容

</div>
```

### ハイライトボックス

```markdown
<div class="highlight">

重要な情報をここに

</div>
```

### 背景画像

```markdown
![bg](image-url)           # 全画面背景
![bg right:40%](image-url) # 右側40%に画像
![bg left](image-url)      # 左側に画像
```

## ディレクトリ構成

```
slides/
├── README.md                    # このファイル
├── create-presentation.sh       # プレゼンテーション作成スクリプト
├── _templates/                  # テンプレートファイル
│   └── presentation.md          # プレゼンテーションテンプレート
├── themes/                      # カスタムテーマ
│   └── casual.css               # Casualテーマ
└── YYYY-MM-DD-title/            # 個別のプレゼンテーション
    ├── presentation.md          # プレゼンテーションファイル
    ├── README.md                # プレゼンテーション用README
    ├── images/                  # 画像ファイル
    └── assets/                  # その他アセット
```

## 命名規則

プレゼンテーションディレクトリは、`create-presentation.sh`を使用すると自動的に以下の形式で作成されます:

```
YYYY-MM-DD-タイトル/
```

例:
- `2026-03-15-introduction-to-marp/`
- `2026-06-20-my-2026-goals/`

## ヒント

- スライドごとに `---` で区切る
- `<!-- コメント -->` でHTMLコメントを追加可能
- Markdown記法がそのまま使える
- 絵文字も自由に使用可能 🎉
- `paginate: true` でページ番号を表示
- `footer: 'テキスト'` でフッターを追加

## 参考リンク

- [Marp公式ドキュメント](https://marpit.marp.app/)
- [Marp CLI](https://github.com/marp-team/marp-cli)
- [Markdown記法](https://www.markdownguide.org/basic-syntax/)

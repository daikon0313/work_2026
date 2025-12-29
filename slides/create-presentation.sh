#!/bin/bash

# プレゼンテーション作成スクリプト
# Usage: ./create-presentation.sh "登壇タイトル"

set -e

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -eq 0 ]; then
    echo -e "${RED}エラー: 登壇タイトルを指定してください${NC}"
    echo -e "使い方: ${YELLOW}./create-presentation.sh \"登壇タイトル\"${NC}"
    echo ""
    echo "例:"
    echo -e "  ${BLUE}./create-presentation.sh \"Introduction to Marp\"${NC}"
    echo -e "  ${BLUE}./create-presentation.sh \"2026年の目標発表\"${NC}"
    exit 1
fi

TITLE="$1"
DATE=$(date +%Y-%m-%d)

# タイトルをファイル名に適した形式に変換（スペースをハイフンに）
# 日本語などのマルチバイト文字もサポート
TITLE_SLUG=$(echo "$TITLE" | sed 's/ /-/g' | sed 's/\//-/g')
DIR_NAME="${DATE}-${TITLE_SLUG}"
DIR_PATH="$(dirname "$0")/${DIR_NAME}"

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ディレクトリが既に存在するかチェック
if [ -d "$DIR_PATH" ]; then
    echo -e "${RED}エラー: ディレクトリ '${DIR_NAME}' は既に存在します${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 プレゼンテーション作成${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  タイトル: ${YELLOW}${TITLE}${NC}"
echo -e "  日付:     ${YELLOW}${DATE}${NC}"
echo -e "  ディレクトリ: ${YELLOW}${DIR_NAME}${NC}"
echo ""

# ディレクトリ作成
echo -e "${BLUE}📁 ディレクトリを作成中...${NC}"
mkdir -p "$DIR_PATH"
mkdir -p "$DIR_PATH/images"
mkdir -p "$DIR_PATH/assets"

# テンプレートをコピー
echo -e "${BLUE}📄 テンプレートをコピー中...${NC}"
cp "$SCRIPT_DIR/_templates/presentation.md" "$DIR_PATH/presentation.md"

# テンプレート内の変数を置換
sed -i.bak "s/プレゼンテーションタイトル/${TITLE}/g" "$DIR_PATH/presentation.md"
sed -i.bak "s/あなたの名前/Your Name/g" "$DIR_PATH/presentation.md"
sed -i.bak "s/2026年/${DATE}/g" "$DIR_PATH/presentation.md"
rm "$DIR_PATH/presentation.md.bak"

# READMEを作成
echo -e "${BLUE}📝 READMEを作成中...${NC}"
cat > "$DIR_PATH/README.md" << EOF
# ${TITLE}

**発表日**: ${DATE}

## 概要

このプレゼンテーションについての説明をここに記載します。

## 構成

- \`presentation.md\` - メインのプレゼンテーションファイル
- \`images/\` - プレゼンテーションで使用する画像
- \`assets/\` - その他のアセット（動画、資料など）

## プレビュー

\`\`\`bash
# このディレクトリに移動
cd ${DIR_NAME}

# プレビュー（ウォッチモード）
marp -w presentation.md

# HTMLに変換
marp presentation.md -o output.html

# PDFに変換
marp presentation.md -o output.pdf
\`\`\`

## メモ

発表に関するメモや注意事項をここに記載します。

EOF

# .gitkeep を作成（空のディレクトリをGitで管理するため）
touch "$DIR_PATH/images/.gitkeep"
touch "$DIR_PATH/assets/.gitkeep"

# 完了メッセージ
echo ""
echo -e "${GREEN}✅ プレゼンテーションディレクトリを作成しました！${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}次のステップ:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  1. ディレクトリに移動:"
echo -e "     ${BLUE}cd ${DIR_NAME}${NC}"
echo ""
echo -e "  2. プレゼンテーションを編集:"
echo -e "     ${BLUE}code presentation.md${NC}  ${GREEN}# または好きなエディタで${NC}"
echo ""
echo -e "  3. プレビュー:"
echo -e "     ${BLUE}marp -w presentation.md${NC}"
echo ""
echo -e "  4. PDF/HTML出力:"
echo -e "     ${BLUE}marp presentation.md -o output.pdf${NC}"
echo -e "     ${BLUE}marp presentation.md -o output.html${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Happy presenting! 🎉${NC}"
echo ""

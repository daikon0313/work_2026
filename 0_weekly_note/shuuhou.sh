#!/bin/bash
set -e

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}週報生成スクリプト${NC}"
echo -e "${BLUE}========================================${NC}"

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# テンプレートファイルのパス
TEMPLATE_FILE="${SCRIPT_DIR}/template.md"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${YELLOW}Error: template.md が見つかりません${NC}"
    exit 1
fi

# 今日の日付を取得
TODAY=$(date +%Y-%m-%d)
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)

# 今月の第何週目かを計算（その月の1日から今日までの週数）
FIRST_DAY_OF_MONTH="${CURRENT_YEAR}-${CURRENT_MONTH}-01"
DAYS_SINCE_FIRST=$(( ( $(date -j -f "%Y-%m-%d" "$TODAY" +%s) - $(date -j -f "%Y-%m-%d" "$FIRST_DAY_OF_MONTH" +%s) ) / 86400 ))
WEEK_OF_MONTH=$(( ($DAYS_SINCE_FIRST / 7) + 1 ))

# 週番号を2桁にフォーマット
WEEK_NUM=$(printf "%02d" $WEEK_OF_MONTH)

# ファイル名を生成 (YYYYMMWW.md)
WEEKLY_FILE="${SCRIPT_DIR}/${CURRENT_YEAR}${CURRENT_MONTH}${WEEK_NUM}.md"

echo -e "\n${GREEN}生成する週報ファイル: ${WEEKLY_FILE}${NC}"

# 既にファイルが存在する場合は確認
if [ -f "$WEEKLY_FILE" ]; then
    echo -e "${YELLOW}Warning: ${WEEKLY_FILE} は既に存在します${NC}"
    read -p "上書きしますか？ (yes/no): " OVERWRITE
    if [ "$OVERWRITE" != "yes" ]; then
        echo -e "${BLUE}処理をキャンセルしました${NC}"
        exit 0
    fi
fi

# 今週の開始日と終了日を計算（月曜日〜日曜日）
DAY_OF_WEEK=$(date +%u)  # 1=月曜日, 7=日曜日
DAYS_TO_MONDAY=$(( ($DAY_OF_WEEK - 1) ))
DAYS_TO_SUNDAY=$(( (7 - $DAY_OF_WEEK) ))

START_DATE=$(date -v-${DAYS_TO_MONDAY}d +%Y-%m-%d)
END_DATE=$(date -v+${DAYS_TO_SUNDAY}d +%Y-%m-%d)

echo -e "${BLUE}期間: ${START_DATE} 〜 ${END_DATE}${NC}"

# 1週間分のGitコミットを取得
echo -e "\n${GREEN}Gitコミット履歴を取得中...${NC}"
cd "$PROJECT_ROOT"

COMMIT_LOG=$(git log --since="${START_DATE} 00:00:00" --until="${END_DATE} 23:59:59" --pretty=format:"- %s (%an, %ar)" --no-merges 2>/dev/null || echo "コミットなし")

# コミット数をカウント
COMMIT_COUNT=$(git log --since="${START_DATE} 00:00:00" --until="${END_DATE} 23:59:59" --oneline --no-merges 2>/dev/null | wc -l | tr -d ' ')

if [ "$COMMIT_COUNT" -eq 0 ]; then
    COMMIT_SUMMARY="今週はコミットがありませんでした。"
    COMMIT_DETAILS="---"
else
    COMMIT_SUMMARY="**総コミット数**: ${COMMIT_COUNT}件"
    COMMIT_DETAILS="${COMMIT_LOG}"
fi

# GitHub Issueを取得（gh CLI使用）
echo -e "${GREEN}GitHub Issueを取得中...${NC}"

if command -v gh &> /dev/null; then
    # クローズしたIssue（今週クローズされたもの）
    CLOSED_ISSUES=$(gh issue list --state closed --search "closed:${START_DATE}..${END_DATE}" --json number,title,closedAt --jq '.[] | "- #\(.number): \(.title) (クローズ日: \(.closedAt[:10]))"' 2>/dev/null || echo "なし")

    if [ -z "$CLOSED_ISSUES" ]; then
        CLOSED_ISSUES="今週クローズしたIssueはありません。"
    fi

    # 進行中のIssue
    OPEN_ISSUES=$(gh issue list --state open --json number,title --jq '.[] | "- #\(.number): \(.title)"' 2>/dev/null || echo "なし")

    if [ -z "$OPEN_ISSUES" ]; then
        OPEN_ISSUES="現在オープンなIssueはありません。"
    fi
else
    echo -e "${YELLOW}Warning: GitHub CLI (gh) がインストールされていません${NC}"
    CLOSED_ISSUES="GitHub CLIがインストールされていないため、自動取得できませんでした。"
    OPEN_ISSUES="GitHub CLIがインストールされていないため、自動取得できませんでした。"
fi

# 週のタイトルを生成
WEEK_TITLE="${CURRENT_YEAR}年${CURRENT_MONTH}月 第${WEEK_OF_MONTH}週"

# テンプレートから週報を生成
echo -e "\n${GREEN}週報ファイルを生成中...${NC}"

# 一時ファイルを使用して段階的に置換
cp "$TEMPLATE_FILE" "$WEEKLY_FILE"

# 単純な置換
sed -i '' "s|WEEK_TITLE|${WEEK_TITLE}|g" "$WEEKLY_FILE"
sed -i '' "s|START_DATE|${START_DATE}|g" "$WEEKLY_FILE"
sed -i '' "s|END_DATE|${END_DATE}|g" "$WEEKLY_FILE"
sed -i '' "s|COMMIT_SUMMARY|${COMMIT_SUMMARY}|g" "$WEEKLY_FILE"

# 複数行のコンテンツを一時ファイルに保存して置換
echo "$COMMIT_DETAILS" > /tmp/commit_details.txt
echo "$CLOSED_ISSUES" > /tmp/closed_issues.txt
echo "$OPEN_ISSUES" > /tmp/open_issues.txt

# Perlを使用して複数行置換（sedよりも扱いやすい）
perl -i -pe 'BEGIN{undef $/;} s|COMMIT_DETAILS|`cat /tmp/commit_details.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|CLOSED_ISSUES|`cat /tmp/closed_issues.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|OPEN_ISSUES|`cat /tmp/open_issues.txt`|ge' "$WEEKLY_FILE"

# 一時ファイルを削除
rm -f /tmp/commit_details.txt /tmp/closed_issues.txt /tmp/open_issues.txt

echo -e "${GREEN}✓ 週報ファイルを生成しました: ${WEEKLY_FILE}${NC}"
echo -e "\n${BLUE}次のステップ:${NC}"
echo -e "1. ${WEEKLY_FILE} を開いて内容を確認"
echo -e "2. 「Claude Code でのやり取り」セクションに今週の主要なトピックを追記"
echo -e "3. 「次週のTODO」セクションに次週のタスクを追加"
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}週報生成完了${NC}"
echo -e "${GREEN}========================================${NC}"

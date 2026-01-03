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

# 現在のQuarterを計算
MONTH_NUM=$((10#$CURRENT_MONTH))  # 先頭の0を削除して数値化
if [ $MONTH_NUM -ge 1 ] && [ $MONTH_NUM -le 3 ]; then
    CURRENT_QUARTER="Q1 (1-3月)"
elif [ $MONTH_NUM -ge 4 ] && [ $MONTH_NUM -le 6 ]; then
    CURRENT_QUARTER="Q2 (4-6月)"
elif [ $MONTH_NUM -ge 7 ] && [ $MONTH_NUM -le 9 ]; then
    CURRENT_QUARTER="Q3 (7-9月)"
else
    CURRENT_QUARTER="Q4 (10-12月)"
fi

# 今月の第何週目かを計算（その月の1日から今日までの週数）
FIRST_DAY_OF_MONTH="${CURRENT_YEAR}-${CURRENT_MONTH}-01"
DAYS_SINCE_FIRST=$(( ( $(date -j -f "%Y-%m-%d" "$TODAY" +%s) - $(date -j -f "%Y-%m-%d" "$FIRST_DAY_OF_MONTH" +%s) ) / 86400 ))
WEEK_OF_MONTH=$(( ($DAYS_SINCE_FIRST / 7) + 1 ))

# 週番号を2桁にフォーマット
WEEK_NUM=$(printf "%02d" $WEEK_OF_MONTH)

# ファイル名を生成 (notes/YYYYMMWW.md)
WEEKLY_FILE="${SCRIPT_DIR}/notes/${CURRENT_YEAR}${CURRENT_MONTH}${WEEK_NUM}.md"

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

# 次週の期間を計算
NEXT_WEEK_START=$(date -v+$((7 - $DAYS_TO_MONDAY))d +%Y-%m-%d)
NEXT_WEEK_END=$(date -v+$((14 - $DAYS_TO_MONDAY))d +%Y-%m-%d)

echo -e "${BLUE}今週の期間: ${START_DATE} 〜 ${END_DATE}${NC}"
echo -e "${BLUE}次週の期間: ${NEXT_WEEK_START} 〜 ${NEXT_WEEK_END}${NC}"

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

# コミットメッセージから主要なトピックを抽出
echo -e "${GREEN}主要なトピックを抽出中...${NC}"
COMMIT_SUBJECTS=$(git log --since="${START_DATE} 00:00:00" --until="${END_DATE} 23:59:59" --pretty=format:"%s" --no-merges 2>/dev/null)

if [ -n "$COMMIT_SUBJECTS" ]; then
    # コミットメッセージから主要なキーワードを抽出（重複排除）
    MAIN_TOPICS=$(echo "$COMMIT_SUBJECTS" | \
        grep -i -o -E "(Add|Update|Fix|Implement|Create|Refactor|Deploy|Build|Test|Document|Remove|Delete)[^(]*" | \
        sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | \
        sort | uniq | \
        head -10 | \
        sed 's/^/- /')

    if [ -z "$MAIN_TOPICS" ]; then
        MAIN_TOPICS="- 今週の主要なトピックはコミットメッセージから抽出できませんでした"
    fi
else
    MAIN_TOPICS="- 今週はコミットがありませんでした"
fi

# Claude Codeでのやり取りを抽出
echo -e "${GREEN}Claude Codeでのやり取りを抽出中...${NC}"

# Claude Codeで生成されたコミットを特定（Co-Authored-Byやクロード関連のパターン）
CLAUDE_COMMITS=$(git log --since="${START_DATE} 00:00:00" --until="${END_DATE} 23:59:59" \
    --grep="Claude Code\|Co-Authored-By: Claude\|🤖" \
    --pretty=format:"%s" --no-merges 2>/dev/null || echo "")

if [ -n "$CLAUDE_COMMITS" ]; then
    # Claude Codeで行った作業を要約
    CLAUDE_WORK=$(echo "$CLAUDE_COMMITS" | \
        grep -v "^$" | \
        head -10 | \
        sed 's/^/- /')

    CLAUDE_TOPICS="${CLAUDE_WORK}"
else
    CLAUDE_TOPICS="- 今週はClaude Codeでの作業記録が見つかりませんでした"
fi

# 学んだこと・気づきのセクション（コミットメッセージから特徴的なものを抽出）
LEARNINGS=$(git log --since="${START_DATE} 00:00:00" --until="${END_DATE} 23:59:59" \
    --grep="学んだ\|気づき\|発見\|改善\|最適化" \
    --pretty=format:"- %s" --no-merges 2>/dev/null | head -5 || echo "")

if [ -z "$LEARNINGS" ]; then
    LEARNINGS="<!-- 手動で追記してください -->\n\n-"
fi

# GitHub Issueを取得（gh CLI使用）
echo -e "${GREEN}GitHub Issueを取得中...${NC}"

if command -v gh &> /dev/null; then
    # 全てのIssueを取得（bodyも含む）
    ALL_ISSUES=$(gh issue list --state open --json number,title,body,labels --limit 100 2>/dev/null || echo "[]")

    # 今週期限のIssueを抽出（「具体的な期限」フィールドが今週中のもの）
    THIS_WEEK_DUE=$(echo "$ALL_ISSUES" | jq -r --arg start "$START_DATE" --arg end "$END_DATE" '.[] |
        select(.body != null) |
        (.body | capture("### 具体的な期限\\s*\\n(?<deadline>[0-9]{4}-[0-9]{2}-[0-9]{2})") | .deadline // "") as $deadline |
        select($deadline >= $start and $deadline <= $end) |
        "- [ ] #\(.number): \(.title) (期限: \($deadline))"' 2>/dev/null || echo "")

    if [ -z "$THIS_WEEK_DUE" ]; then
        THIS_WEEK_DUE_ISSUES="今週期限のIssueはありません。"
    else
        THIS_WEEK_DUE_ISSUES="$THIS_WEEK_DUE"
    fi

    # クローズしたIssue（今週クローズされたもの）
    CLOSED_ISSUES=$(gh issue list --state closed --search "closed:${START_DATE}..${END_DATE}" --json number,title,closedAt,labels --jq '.[] | "- #\(.number): \(.title) (クローズ日: \(.closedAt[:10]))"' 2>/dev/null || echo "")

    if [ -z "$CLOSED_ISSUES" ]; then
        CLOSED_ISSUES="今週クローズしたIssueはありません。"
    fi

    # 進行中のIssue（現在のQuarterのもの）
    echo -e "${GREEN}進行中のIssue（${CURRENT_QUARTER}）を取得中...${NC}"
    OPEN_ISSUES=$(echo "$ALL_ISSUES" | jq -r --arg quarter "$CURRENT_QUARTER" '.[] |
        select(.body != null) |
        (.body | capture("### 目標期限（四半期）\\s*\\n(?<q>[^\\n]+)") | .q // "") as $issue_quarter |
        (.body | capture("### 具体的な期限\\s*\\n(?<deadline>[0-9]{4}-[0-9]{2}-[0-9]{2})") | .deadline // "期限なし") as $deadline |
        select($issue_quarter == $quarter) |
        "- #\(.number): \(.title) (期限: \($deadline))"' 2>/dev/null || echo "")

    if [ -z "$OPEN_ISSUES" ]; then
        OPEN_ISSUES="現在のQuarter（${CURRENT_QUARTER}）にオープンなIssueはありません。"
    fi

    # 次週のTODO（次週期限のIssue）
    echo -e "${GREEN}次週のTODOを生成中...${NC}"

    NEXT_WEEK_DUE=$(echo "$ALL_ISSUES" | jq -r --arg start "$NEXT_WEEK_START" --arg end "$NEXT_WEEK_END" '.[] |
        select(.body != null) |
        (.body | capture("### 具体的な期限\\s*\\n(?<deadline>[0-9]{4}-[0-9]{2}-[0-9]{2})") | .deadline // "") as $deadline |
        select($deadline >= $start and $deadline <= $end) |
        "- [ ] #\(.number): \(.title) (期限: \($deadline))"' 2>/dev/null || echo "")

    if [ -z "$NEXT_WEEK_DUE" ]; then
        # 次週期限がなければ、現在のQuarterのIssueを上位5件表示
        NEXT_WEEK_TODOS=$(echo "$ALL_ISSUES" | jq -r --arg quarter "$CURRENT_QUARTER" 'limit(5; .[] |
            select(.body != null) |
            (.body | capture("### 目標期限（四半期）\\s*\\n(?<q>[^\\n]+)") | .q // "") as $issue_quarter |
            select($issue_quarter == $quarter) |
            "- [ ] #\(.number): \(.title)")' 2>/dev/null || echo "")
        if [ -z "$NEXT_WEEK_TODOS" ]; then
            NEXT_WEEK_TODOS="次週期限のIssueはありません。"
        fi
    else
        NEXT_WEEK_TODOS="${NEXT_WEEK_DUE}"
    fi
else
    echo -e "${YELLOW}Warning: GitHub CLI (gh) がインストールされていません${NC}"
    THIS_WEEK_DUE_ISSUES="GitHub CLIがインストールされていないため、自動取得できませんでした。"
    CLOSED_ISSUES="GitHub CLIがインストールされていないため、自動取得できませんでした。"
    OPEN_ISSUES="GitHub CLIがインストールされていないため、自動取得できませんでした。"
    NEXT_WEEK_TODOS="- [ ] GitHub CLIをインストールして自動取得を有効にする"
    MAIN_TOPICS="- GitHub CLIがインストールされていないため、トピックを自動抽出できませんでした"
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
echo "$THIS_WEEK_DUE_ISSUES" > /tmp/this_week_due.txt
echo "$CLOSED_ISSUES" > /tmp/closed_issues.txt
echo "$OPEN_ISSUES" > /tmp/open_issues.txt
echo "$MAIN_TOPICS" > /tmp/main_topics.txt
echo "$CLAUDE_TOPICS" > /tmp/claude_topics.txt
echo "$LEARNINGS" > /tmp/learnings.txt
echo "$NEXT_WEEK_TODOS" > /tmp/next_week_todos.txt

# Perlを使用して複数行置換（sedよりも扱いやすい）
perl -i -pe 'BEGIN{undef $/;} s|COMMIT_DETAILS|`cat /tmp/commit_details.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|THIS_WEEK_DUE_ISSUES|`cat /tmp/this_week_due.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|CLOSED_ISSUES|`cat /tmp/closed_issues.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|OPEN_ISSUES|`cat /tmp/open_issues.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|MAIN_TOPICS|`cat /tmp/main_topics.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|CLAUDE_TOPICS|`cat /tmp/claude_topics.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|LEARNINGS|`cat /tmp/learnings.txt`|ge' "$WEEKLY_FILE"
perl -i -pe 'BEGIN{undef $/;} s|NEXT_WEEK_TODOS|`cat /tmp/next_week_todos.txt`|ge' "$WEEKLY_FILE"

# 一時ファイルを削除
rm -f /tmp/commit_details.txt /tmp/this_week_due.txt /tmp/closed_issues.txt /tmp/open_issues.txt /tmp/main_topics.txt /tmp/claude_topics.txt /tmp/learnings.txt /tmp/next_week_todos.txt

echo -e "${GREEN}✓ 週報ファイルを生成しました: ${WEEKLY_FILE}${NC}"
echo -e "\n${BLUE}次のステップ:${NC}"
echo -e "1. ${WEEKLY_FILE} を開いて内容を確認"
echo -e "2. Claude Codeでのやり取りや学んだことを追記（必要に応じて）"
echo -e "3. 次週のTODOに手動タスクを追加（必要に応じて）"
echo -e "\n${BLUE}自動生成された内容:${NC}"
echo -e "- Gitコミット履歴とサマリー"
echo -e "- 期限ベースでフィルタリングされたGitHub Issue"
echo -e "- Claude Codeで行った作業の抽出"
echo -e "- 次週期限のTODOリスト"
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}週報生成完了${NC}"
echo -e "${GREEN}========================================${NC}"

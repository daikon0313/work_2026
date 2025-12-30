const fs = require('fs');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPOSITORY = process.env.REPOSITORY;
const [owner, repo] = REPOSITORY.split('/');

// GitHub APIリクエスト
function githubRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API Error: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// すべてのIssueを取得（ページネーション対応）
async function getAllIssues() {
  let allIssues = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const issues = await githubRequest(`/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`);
    allIssues = allIssues.concat(issues);
    hasMore = issues.length === 100;
    page++;
  }

  // Pull Requestを除外
  return allIssues.filter(issue => !issue.pull_request);
}

// カテゴリーラベルを取得（ラベルまたは本文から）
function getCategoryLabel(issue) {
  // まずラベルをチェック（後方互換性のため）
  const categoryLabels = ['career', 'learning', 'health', 'personal', 'financial'];
  const label = issue.labels.find(l => categoryLabels.includes(l.name));
  if (label) return label.name;

  // ラベルがない場合、issue本文からカテゴリを抽出
  if (issue.body) {
    // "### カテゴリ" セクションからカテゴリを読み取る
    const categoryMatch = issue.body.match(/###\s*カテゴリ[^\n]*\n\s*(.+)/);
    if (categoryMatch) {
      const categoryText = categoryMatch[1].trim();

      // カテゴリテキストからマッピング
      if (categoryText.includes('Career') || categoryText.includes('キャリア')) return 'career';
      if (categoryText.includes('Learning') || categoryText.includes('学習')) return 'learning';
      if (categoryText.includes('Health') || categoryText.includes('健康')) return 'health';
      if (categoryText.includes('Personal') || categoryText.includes('個人')) return 'personal';
      if (categoryText.includes('Financial') || categoryText.includes('財務')) return 'financial';
    }
  }

  return null;
}

// 四半期を取得
function getQuarter(issue) {
  const quarterRegex = /Q([1-4])/i;

  // タイトルから四半期を検索
  const titleMatch = issue.title.match(quarterRegex);
  if (titleMatch) return `Q${titleMatch[1]}`;

  // 本文から四半期を検索
  if (issue.body) {
    const bodyMatch = issue.body.match(quarterRegex);
    if (bodyMatch) return `Q${bodyMatch[1]}`;
  }

  return null;
}

// 進捗バーを生成
function generateProgressBar(percentage) {
  const total = 20;
  const filled = Math.round((percentage / 100) * total);
  const empty = total - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// カテゴリー名を日本語に変換
function getCategoryNameJa(category) {
  const categoryMap = {
    'career': '💼 キャリア',
    'learning': '📚 学習',
    'health': '🏃 健康',
    'personal': '🎨 個人',
    'financial': '💰 財務'
  };
  return categoryMap[category] || category;
}

// 現在の四半期を取得
function getCurrentQuarter() {
  const now = new Date();
  const year = 2026;
  const currentYear = now.getFullYear();

  // 2026年でない場合はQ1を返す
  if (currentYear !== year) {
    return 'Q1';
  }

  const month = now.getMonth() + 1; // 1-12
  if (month >= 1 && month <= 3) return 'Q1';
  if (month >= 4 && month <= 6) return 'Q2';
  if (month >= 7 && month <= 9) return 'Q3';
  return 'Q4';
}

// 年間・月間進捗を計算
function calculateTimeProgress() {
  const now = new Date();
  const year = 2026;

  // 現在の日付が2026年でない場合は、2026年1月1日を基準にする
  const currentYear = now.getFullYear();
  const isIn2026 = currentYear === year;

  // 2026年の日数（うるう年ではない）
  const daysInYear = 365;

  // 年間進捗を計算
  let dayOfYear, yearProgress;
  if (isIn2026) {
    const startOfYear = new Date(year, 0, 1);
    const diffTime = now - startOfYear;
    dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    yearProgress = Math.round((dayOfYear / daysInYear) * 100);
  } else {
    // 2026年以外の場合は0%とする
    dayOfYear = 0;
    yearProgress = 0;
  }

  // 月間進捗を計算
  const currentMonth = isIn2026 ? now.getMonth() : 0; // 0-11
  const currentDate = isIn2026 ? now.getDate() : 0; // 1-31
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const monthProgress = isIn2026 ? Math.round((currentDate / daysInMonth) * 100) : 0;

  return {
    dayOfYear,
    daysInYear,
    yearProgress,
    currentDate: isIn2026 ? currentDate : 0,
    daysInMonth,
    monthProgress,
    monthName: `${currentMonth + 1}月`
  };
}

// メイン処理
async function main() {
  console.log('Issueデータを取得中...');
  const allIssues = await getAllIssues();

  // goalラベルを持つIssue、またはタイトルが[GOAL]で始まるIssue、またはカテゴリが判定できるIssue
  const goalIssues = allIssues.filter(issue => {
    // goalラベルがある
    if (issue.labels.some(l => l.name === 'goal')) return true;

    // タイトルが[GOAL]で始まる（Issue Formsで作成された可能性が高い）
    if (issue.title.startsWith('[GOAL]')) return true;

    // カテゴリが判定できる（本文にカテゴリ情報がある）
    if (getCategoryLabel(issue)) return true;

    return false;
  });

  console.log(`${goalIssues.length}件の目標を見つけました`);

  // カテゴリー別に集計
  const categories = ['career', 'learning', 'health', 'personal', 'financial'];
  const stats = {};
  const currentQuarter = getCurrentQuarter();

  categories.forEach(cat => {
    const categoryIssues = goalIssues.filter(issue => getCategoryLabel(issue) === cat);
    const completed = categoryIssues.filter(i => i.state === 'closed').length;
    const openIssues = categoryIssues.filter(i => i.state === 'open');

    // 進行中: 現在の四半期のopenなIssue
    const inProgress = openIssues.filter(i => getQuarter(i) === currentQuarter).length;

    // 未着手: 将来の四半期または四半期未指定のopenなIssue
    const notStarted = openIssues.filter(i => {
      const quarter = getQuarter(i);
      return quarter !== currentQuarter;
    }).length;

    stats[cat] = {
      total: categoryIssues.length,
      completed: completed,
      inProgress: inProgress,
      notStarted: notStarted
    };
  });

  // 全体の統計
  const totalGoals = goalIssues.length;
  const completedGoals = goalIssues.filter(i => i.state === 'closed').length;
  const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // 時間進捗を計算
  const timeProgress = calculateTimeProgress();

  // README.mdを読み込み
  let readme = fs.readFileSync('README.md', 'utf8');

  // 時間進捗セクションを更新
  const timeProgressSection = `### 📅 2026年の進捗
\`\`\`
年間進捗: ${generateProgressBar(timeProgress.yearProgress)} ${timeProgress.yearProgress}% (${timeProgress.dayOfYear}/${timeProgress.daysInYear}日)
\`\`\`

### 📆 今月の進捗（${timeProgress.monthName}）
\`\`\`
月間進捗: ${generateProgressBar(timeProgress.monthProgress)} ${timeProgress.monthProgress}% (${timeProgress.currentDate}/${timeProgress.daysInMonth}日)
\`\`\``;

  readme = readme.replace(
    /<!-- TIME_PROGRESS_START -->[\s\S]*?<!-- TIME_PROGRESS_END -->/,
    `<!-- TIME_PROGRESS_START -->\n${timeProgressSection}\n<!-- TIME_PROGRESS_END -->`
  );

  // 進捗セクションを更新
  const progressSection = `\`\`\`
全体の進捗: ${generateProgressBar(progressPercentage)} ${progressPercentage}% (${completedGoals}/${totalGoals} 目標達成)
\`\`\`

### カテゴリー別の目標

| カテゴリー | 合計 | 完了 | 進行中 | 未着手 |
|----------|------|------|--------|--------|
| 💼 キャリア | ${stats.career.total} | ${stats.career.completed} | ${stats.career.inProgress} | ${stats.career.notStarted} |
| 📚 学習 | ${stats.learning.total} | ${stats.learning.completed} | ${stats.learning.inProgress} | ${stats.learning.notStarted} |
| 🏃 健康 | ${stats.health.total} | ${stats.health.completed} | ${stats.health.inProgress} | ${stats.health.notStarted} |
| 🎨 個人 | ${stats.personal.total} | ${stats.personal.completed} | ${stats.personal.inProgress} | ${stats.personal.notStarted} |
| 💰 財務 | ${stats.financial.total} | ${stats.financial.completed} | ${stats.financial.inProgress} | ${stats.financial.notStarted} |`;

  readme = readme.replace(
    /<!-- PROGRESS_START -->[\s\S]*?<!-- PROGRESS_END -->/,
    `<!-- PROGRESS_START -->\n${progressSection}\n<!-- PROGRESS_END -->`
  );

  // 達成した目標を更新
  const completedIssues = goalIssues.filter(i => i.state === 'closed').slice(0, 10);
  let completedSection = '';

  if (completedIssues.length > 0) {
    completedSection = completedIssues.map(issue => {
      const category = getCategoryLabel(issue);
      const categoryName = category ? getCategoryNameJa(category) : '';
      const closedDate = issue.closed_at ? new Date(issue.closed_at).toLocaleDateString('ja-JP') : '';
      return `- [${categoryName}] **[${issue.title.replace('[GOAL] ', '')}](${issue.html_url})** - 達成日: ${closedDate}`;
    }).join('\n');
  } else {
    completedSection = '*まだ達成した目標はありません*';
  }

  readme = readme.replace(
    /<!-- COMPLETED_GOALS_START -->[\s\S]*?<!-- COMPLETED_GOALS_END -->/,
    `<!-- COMPLETED_GOALS_START -->\n${completedSection}\n<!-- COMPLETED_GOALS_END -->`
  );

  // 現在の焦点を更新
  const openIssues = goalIssues.filter(i => i.state === 'open').slice(0, 5);
  let currentFocusSection = '';

  if (openIssues.length > 0) {
    currentFocusSection = openIssues.map(issue => {
      const category = getCategoryLabel(issue);
      const categoryName = category ? getCategoryNameJa(category) : '';
      return `- [${categoryName}] **[${issue.title.replace('[GOAL] ', '')}](${issue.html_url})**`;
    }).join('\n');
  } else {
    currentFocusSection = '*目標を[Issuesから追加](../../issues/new/choose)してください*';
  }

  readme = readme.replace(
    /<!-- CURRENT_FOCUS_START -->[\s\S]*?<!-- CURRENT_FOCUS_END -->/,
    `<!-- CURRENT_FOCUS_START -->\n${currentFocusSection}\n<!-- CURRENT_FOCUS_END -->`
  );

  // README.mdを保存
  fs.writeFileSync('README.md', readme);
  console.log('README.mdを更新しました！');
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

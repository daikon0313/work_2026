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

// カテゴリーラベルを取得
function getCategoryLabel(issue) {
  const categoryLabels = ['career', 'learning', 'health', 'personal', 'financial'];
  const label = issue.labels.find(l => categoryLabels.includes(l.name));
  return label ? label.name : null;
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

// メイン処理
async function main() {
  console.log('Issueデータを取得中...');
  const allIssues = await getAllIssues();

  // goalラベルを持つIssueのみ
  const goalIssues = allIssues.filter(issue =>
    issue.labels.some(l => l.name === 'goal')
  );

  console.log(`${goalIssues.length}件の目標を見つけました`);

  // カテゴリー別に集計
  const categories = ['career', 'learning', 'health', 'personal', 'financial'];
  const stats = {};

  categories.forEach(cat => {
    const categoryIssues = goalIssues.filter(issue => getCategoryLabel(issue) === cat);
    const completed = categoryIssues.filter(i => i.state === 'closed').length;
    const open = categoryIssues.filter(i => i.state === 'open').length;

    stats[cat] = {
      total: categoryIssues.length,
      completed: completed,
      inProgress: open,
      notStarted: 0 // 現在のIssueシステムでは区別できないため0
    };
  });

  // 全体の統計
  const totalGoals = goalIssues.length;
  const completedGoals = goalIssues.filter(i => i.state === 'closed').length;
  const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // README.mdを読み込み
  let readme = fs.readFileSync('README.md', 'utf8');

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
    completedSection = '*まだ達成した目標はありません。さあ、始めましょう！*';
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
    currentFocusSection = '*Issuesに現在の目標を追加して始めましょう！*';
  }

  readme = readme.replace(
    /<!-- CURRENT_FOCUS_START -->[\s\S]*?<!-- CURRENT_FOCUS_END -->/,
    `<!-- CURRENT_FOCUS_START -->\n${currentFocusSection}\n<!-- CURRENT_FOCUS_END -->`
  );

  // 四半期ごとの目標を更新
  for (let q = 1; q <= 4; q++) {
    const quarterIssues = goalIssues.filter(issue => getQuarter(issue) === `Q${q}`);
    let quarterSection = '';

    if (quarterIssues.length > 0) {
      quarterSection = quarterIssues.map(issue => {
        const category = getCategoryLabel(issue);
        const categoryName = category ? getCategoryNameJa(category) : '';
        const status = issue.state === 'closed' ? 'x' : ' ';
        return `- [${status}] [${categoryName}] [${issue.title.replace('[GOAL] ', '')}](${issue.html_url})`;
      }).join('\n');
    } else {
      quarterSection = '- [ ] 目標を追加してください';
    }

    readme = readme.replace(
      new RegExp(`<!-- Q${q}_GOALS_START -->[\s\S]*?<!-- Q${q}_GOALS_END -->`, 'g'),
      `<!-- Q${q}_GOALS_START -->\n${quarterSection}\n<!-- Q${q}_GOALS_END -->`
    );
  }

  // README.mdを保存
  fs.writeFileSync('README.md', readme);
  console.log('README.mdを更新しました！');
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

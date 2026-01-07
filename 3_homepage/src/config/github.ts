// GitHub設定
export const GITHUB_CONFIG = {
  owner: 'daikon0313',
  repo: 'work_2026',
  label: '読みたい記事',
}

// GitHub Personal Access Tokenは環境変数から取得
// ローカル開発時は.env.localに設定
export const getGitHubToken = (): string | null => {
  // Viteの環境変数はimport.meta.envから取得
  return import.meta.env.VITE_GITHUB_TOKEN || null
}

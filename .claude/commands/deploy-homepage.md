# ホームページをデプロイ

## ローカルでビルドテスト

```bash
npm run homepage:build
```

ビルドが成功したら、プレビューで確認：

```bash
npm run homepage:preview
```

## GitHub Pagesにデプロイ

1. 変更をコミット
2. PRを作成
3. mainブランチにマージ

マージ後、GitHub Actionsが自動的にデプロイを実行します。

デプロイ完了後、以下のURLでアクセス可能：
https://[ユーザー名].github.io/work_2026/

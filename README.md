# diary-app

## 概要

画像を用いた日記アプリケーションです。

## 必要条件

- Node.js v20.9.0
- npm v10.1.0

## 使用技術

- biome v1.8.3 (リンター/フォーマッター)
- lefthook v1.7.13 (Git フック管理)
- vitest v2.0.5 (テストフレームワーク)

## セットアップ

1. リポジトリをクローンします。
2. プロジェクトのルートディレクトリに移動します。
3. 依存関係をインストールします：

```bash
npm ci
```

4. Git フックをセットアップします：

```bash
npx lefthook install
```

## 開発

このプロジェクトは monorepo 構造を採用しています。

### フロントエンド開発

```bash
npx -w src/frontend npm run {script}
```

### バックエンド開発

```bash
npx -w src/backend npm run {script}
```

`{script}` には実行したい npm スクリプト名を指定してください。

## テスト

バックエンドにはスナップショットテストを実装しています。

テストの実行：

```bash
npx -w src/backend npm run test
```

スナップショットの更新：

```bash
npx -w src/backend npm run test -- -u
```

## コード品質

commit 前や push 前に自動的に lint と format が実行されます。これは lefthook によって管理されています。

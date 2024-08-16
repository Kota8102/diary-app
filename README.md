# diary-app

## 概要

画像を用いた日記アプリです。

## 環境

- Node.js v20.9.0
- npm v10.1.0
- biome v1.8.3

## インストール

以下のコードをリポジトリをルートで実行してください。

```bash
npm ci
```

## 使い方

monorepo で管理をしています。

フロントエンドの開発を行う場合は以下のコードを実行してください。

```bash
npx -w src/frontend npm run {script}
```

バックエンドの開発を行う場合は以下のコードを実行してください。

```bash
npx -w src/backend npm run {script}
```

## テスト

バックエンドには、スナップショットテストを追加しています。

```bash
npx -w src/backend npm run test
```

内容を確認して以下を用いて更新してください。

```bash
npx -w src/backend npm run test -- -u
```

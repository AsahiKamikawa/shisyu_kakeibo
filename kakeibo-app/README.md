# 絶対死守 家計簿（PWA）

Excelの家計簿「絶対死守_家計簿_2026年6月以降.xlsx」を、iPhoneのホーム画面に置いて使えるオフライン対応のPWA（Webアプリ）として作り直したものです。

- 返済優先・**死守ライン**判定（月末残高がラインを下回ると「危険」表示）
- 月ごとに**項目を自由にカスタマイズ**（追加・削除・改名、前月コピー）
- 収支の記録（収入＋／支出−、予定／実績）
- グラフで状況管理（月末残高の推移、支出内訳、予算 vs 実績）
- ダッシュボードで「**今月あと何にいくら使えるか**」をカテゴリ別バーで表示
- データは**端末のローカルストレージ**にのみ保存（外部送信なし）。バックアップ書き出し／読み込み対応。
- 新バージョン公開時は、ホーム画面アプリに**更新バナー**が出て「更新」で反映。

> プライバシー: GitHub Pages（無料）は**公開**されます。そのため、公開される初期データは「項目名・カテゴリのみ・金額0」のテンプレートにしています。実際の金額はアプリ起動後にご自身の端末で入力するか、バックアップJSONを読み込んで端末内にのみ保存してください（後述）。

## 技術スタック

- Vite + React + TypeScript
- Tailwind CSS v4（モバイル向けUI）
- Zustand（`persist` で localStorage に自動保存）
- Recharts（グラフ）
- vite-plugin-pwa（manifest + Service Worker、更新は `prompt` 方式）

## 開発（Windows）

Node.js が必要です（未導入なら `winget install OpenJS.NodeJS.LTS`）。

```bash
npm install
npm run dev      # 開発サーバー: http://localhost:5173/
npm run build    # 本番ビルド -> dist/
npm run preview  # ビルド結果をローカル確認
```

アイコンを作り直す場合: `node scripts/generate-icons.mjs`

## GitHub Pages へのデプロイ

このリポジトリには GitHub Actions のワークフロー（`../.github/workflows/deploy.yml`）が含まれており、`main` に push すると自動でビルド＆公開します。配信パス（`base`）はリポジトリ名から自動計算されます。

初回セットアップ:

1. GitHub で新しいリポジトリを作成し、このフォルダ群（リポジトリ直下に `kakeibo-app/` と `.github/` がある状態）を push する。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に設定。
3. `main` に push すると Actions が走り、完了後に Pages の URL（`https://ユーザー名.github.io/リポジトリ名/`）が発行される。

以降はコードを変更して `main` に push するたびに自動で再公開され、ホーム画面アプリ側に更新バナーが出ます。

## iPhoneのホーム画面に追加する手順

1. 上記の GitHub Pages の URL を iPhone の **Safari** で開く。
2. 共有ボタン（□から↑）→ **「ホーム画面に追加」**。
3. ホーム画面のアイコンから起動。初回読み込み後はオフラインでも起動できます。

## 自分の金額データを復元する（端末内のみ）

公開版は金額が空のテンプレートです。Excel由来の実際の数字は、リポジトリには含めていないバックアップファイル `kakeibo-personal-backup.json`（このプロジェクトの1つ上の階層に生成）から読み込めます。

1. `kakeibo-personal-backup.json` を iPhone に移す（自分宛にメール／AirDrop／iCloud Drive など）。
2. アプリの **設定 → バックアップを読み込む** からそのファイルを選択。
3. 6月／7月／8月の実際の金額・死守ラインが復元され、以降は端末内にのみ保存されます。

その後の入力内容も、**設定 → バックアップを書き出す** で定期的にJSON保存しておくと安心です（機種変更やSafariのサイトデータ削除に備え）。

## 更新通知の仕組み

- `registerType: 'prompt'` で、新しい Service Worker を検知すると「新しいバージョンがあります → 更新」のバナーを表示します（[src/components/UpdatePrompt.tsx](src/components/UpdatePrompt.tsx)）。
- 1時間ごと＋アプリを再表示したタイミングで更新を自動チェックします。
- 「更新」を押すと最新版に切り替わります。入力済みデータ（localStorage）は更新後も保持されます。

> 補足: iOSのプッシュ通知（アプリを開いていないときのバッジ／通知）はPNGアプリ化＋iOS 16.4以降＋プッシュ用サーバーが必要で、本アプリはそこまでは行いません。本アプリの「更新通知」は、アプリを開いたときに表示されるアプリ内バナー方式です。

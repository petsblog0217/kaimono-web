# CLAUDE.md — kaimono-web（かいものメモ Web版）

> Claude 系AIがこのプロジェクトで作業を始めるとき最初に読むファイル。
> 全社共通ルールは母艦 **agent-ops**（`~/Documents/dev/agent-ops`、`docs/global/`）が正。
> **最終更新：2026-06-29**

## 0. 母艦ポインタ
- 会社の土台・共通ルールは agent-ops が正。優先順位は ADR-003（詳細＝この案件固有が上書き可。ただし安全・セキュリティ・キャラ根幹は覆せない）。
- slug: `kaimono-web`。GitHub: `petsblog0217/kaimono-web`（**公開**・GitHub Pages配信用）。

## 1. これは何か
- 「かいものメモ」Webアプリ。**単一HTML（`index.html`）完結・ビルド不要**・Windowsでダブルクリックでも開ける。
- iOSアプリ版（SwiftUI）は別リポ `magnet-memo`（非公開）。Web版はそこから派生した自分用の作り直し。
- 公開URL：https://petsblog0217.github.io/kaimono-web/

## 2. 技術構成
- 素のHTML/CSS/JS（フレームワークなし）。状態は localStorage `kaimono-memo-v6`（スキーマ変更時にキーを上げる）。
- アイコンは全部インラインSVG（`ICONS`）。見分けづらい17種は選択肢から除外（`ICON_HIDDEN`、定義は残す）。
- 家族と共有：Firebase Realtime Database（compat SDK・CDN）。`state` まるごとを `/rooms/{合言葉}/state` に同期（最後に書いた人が反映の簡易方式）。匿名認証。設定は `FIREBASE_CONFIG`（公開前提の値）。共有設定は別キー `kaimono-share`（同期対象外）。Firebaseが空配列を落とす癖は `normalizeState` で吸収。
- Firebaseプロジェクト：`kaimonomemo-a9f51`（Spark無料・たーやんのGoogleアカウント）。DBルールは rooms/$room を auth!=null に限定。

## 3. 主な機能
- ホームに全店を縦に並べて表示＋上部タブ。商品タップで買い済み→「在庫へ」自動補充。家の在庫ページ（増減・カゴへ・削除、お店ごとのセクション表示）。一覧（買い物リスト・在庫・辞書）はすべて1列表示。
- ひらがな先頭一致の候補から追加（辞書DB）。候補は全件表示（カテゴリ順→50音順、在庫追加時はお店ごとに見出し分け）。追加シートは×ボタン/グリップで閉じる。新規はアイコン選択可（色は店の色に統一）。
- 追加シートに並び替え（50音順／よく買う順＝追加頻度を`freq`で記録）と「まとめて選ぶ」複数選択モード（チェックして「N個をまとめて追加」）。設定はlocalStorage（`kaimono-sort`/`kaimono-multi`）に記憶。
- 新規登録にふりがな欄。漢字で打つとIME入力（変換前のひらがな）を`compositionupdate/end`で拾って自動セット、違えば手直し可（手で直すと以後は上書きしない）。
- 候補シードと一度きりのマイグレーション：`extraSeeded`（候補追加）／`v2done`（スーパーのカテゴリ再編：果物分離・肉/魚分割・ごはん・パン統合・肉は細分のみ＝汎用肉削除＋他店候補追加）。既存localStorageと共有部屋の両方に適用（attachRoom内でも実行→push）。名前+お店で重複弾き、消した物は復活させない。
- 設定：お店の追加/削除/色/カテゴリ編集。商品（辞書）の管理＝検索＋お店ごと折りたたみ＋1列タイル、編集/削除/追加。
- 自動並び替え：辞書も買い物リストもカテゴリ＋ふりがな50音順（買い物リストは買い済みを下に維持）。
- 買い物リストのタイル：タイル本体タップ＝買い済みトグル、左アイコンタップ＝ミニメニュー（数量 −＋・リストから削除）。`itemSheet`。※旧・長押し方式はiOS Safariの文字選択（青反転）とぶつかるため廃止。
- 家族と共有：ヘッダー共有ボタン→「合言葉を作る/参加/抜ける」。

## 4. 作業の約束
- 全社共通ルール（agent-ops/docs/global）に従う。ツール実行前は日本語で説明して承認を得る。ファイル削除・大きな構成変更は確認。
- 非エンジニア（CEO たーやん）向けに、コードの話は専門用語に補足を添える。
- 更新は `git push` で GitHub Pages に自動反映（数十秒）。push は本人の依頼があるときに。
- セキュリティ：家族共有はデータが端末外（クラウド）に出る§6案件。守りは合言葉＋DBルール。FirebaseのWeb設定値は公開前提で秘密でない。詳細は Claude memory [[magnet-memo-family-share]]。

## 5. TODO
- **PWA化＝実装済**（`manifest.webmanifest`・`sw.js`・apple用metaタグ・`icon-180/192/512.png`）。狙いは「ホーム画面アイコンから開くとリストが毎回リセットされる」問題の解消＝standalone化で保存(localStorage)を永続化＋オフライン対応。SWはネット優先・失敗時キャッシュ（push後の更新が届く）。**反映には旧ホーム画面アイコンを一度削除→Safariで開き直して再度ホーム画面に追加が必要**。
- **アイコンは仮**（PowerShell/System.Drawingで生成した緑の買い物バッグ）。本番アイコンに差し替えたい（元データ候補＝旧 magnet-memo の `AppIcon.svg`、SVG→各サイズPNG手段は要決め）。
- 共有の参加をQR/リンクでも。
- 旧 magnet-memo/web/ の整理（Web版はこのリポに移管済。旧 web/ は後で削除候補）。

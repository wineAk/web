# toggleDisplay

フォーム要素の表示・非表示を動的に切り替えるTypeScriptライブラリです。

## 🚀 機能

- ✅ 一行テキスト、複数行テキスト、チェックボックス、ラジオボタン、プルダウン対応
- ✅ ファイルアップロード、日付、数字、パスワード対応
- ✅ 住所セット（都道府県・市区町村）対応
- ✅ 必須項目の動的制御
- ✅ バージョン管理機能（ビルド時自動挿入）
- ✅ 並列ビルド対応（開発用・本番用同時生成）

## 📦 インストール

```bash
npm install
```

## 🔧 開発

```bash
# 開発用・本番用ビルド（両方同時生成）
npm run dev
npm run build
```

## テスト

```bash
# Chromium 取得 → ビルド → 全7件の Playwright テスト
npm run test
```

## 💻 使い方

### CDN

```html
<script src="https://wineak.github.io/web/toggleDisplay/dist/td.min.js"></script>
```

### 基本的な使い方

```html
<script>
addEventListener('pageshow', () => {
  // 一行テキスト
  toggleDisplay({
    source: {
      selector: "wf12345678001", // トリガーとなる要素の「name属性」
    },
    targets: [
      {
        selector: "一行テキストに入力があったら表示" //  表示の対象となるグループラベルの「項目名称」
      },
      {
        selector: "wf12345678002", // 表示の対象となる要素の「name属性」
        required: true // 表示の対象を必須にするなら「true」を設定
      }
    ],
  });
  // 複数行テキスト
  toggleDisplay({
    source: {
      selector: "wf12345678003",
    },
    targets: [
      {
        selector: "複数行テキストに.*表示" // グループラベルの「項目名称」は正規表現も可能
      },
      {
        selector: "wf12345678004",
        required: false // 表示の対象を必須にしないなら「false」を設定
      }
    ],
  });
  // チェックボックス
  toggleDisplay({
    source: {
      selector: "wf12345678010",
      values: ["A", "B"], // 「選択項目」は完全一致で判定
    },
    targets: [
      {
        selector: "wf12345678011"
        // `required` を省略した場合は `required: false` と同じ設定となる
      }
    ],
  });
  // プルダウン
  toggleDisplay({
    source: {
      selector: "wf12345678012",
      values: [".*[都道府]"], // 「選択項目」は正規表現も可能
    },
    targets: [
      // 表示の対象は複数指定も可能
      { selector: "wf12345678013" },
      { selector: "wf12345678014" },
      { selector: "wf12345678015" }
    ],
  });
});
</script>
```

### バージョン確認

```javascript
// ブラウザでバージョン確認
console.log(window.toggleDisplayVersion()); // "1.0.0"
```

### デバッグログ（動かない原因の調査用）

```javascript
// デバッグON（localStorageに保存され、次回以降も有効）
toggleDisplaySetDebug(true);

// またはコンソールから事前設定（スクリプト読み込み前でも可）
localStorage.setItem('toggleDisplayDebug', 'true');

// デバッグOFF
toggleDisplaySetDebug(false);

// 状態確認
console.log(toggleDisplayIsDebug()); // true / false
```

デバッグON時、コンソールに `[toggleDisplay:debug][カテゴリ]` 形式でログが出力されます。

| カテゴリ | 確認できること |
|---------|--------------|
| `init` | スクリプト読み込み完了 |
| `pageshow` | ライブラリ内 pageshow 発火 |
| `toggle` | toggleDisplay 呼び出し・source 種別判定 |
| `selector` | 要素解決（name / file_view_ID / label） |
| `target` | 表示切替・required 制御 |
| `registry` | ルール評価結果（evaluationResults） |
| `checkbox` | チェックボックス必須化の同期 |

**注意:** `values` には選択肢の **表示ラベルではなく value属性** を指定してください。デバッグログの `radioOptions` / `selectOptions` で実際の value を確認できます。

## 🛠️ 対応要素

| 要素タイプ | セレクター | 説明 |
|-----------|-----------|------|
| 一行テキスト | `name`属性 | テキスト入力時に対象を表示 |
| 複数行テキスト | `name`属性 | テキスト入力時に対象を表示 |
| チェックボックス | `name`属性 + `values` | 指定値がチェックされた時に対象を表示 |
| ラジオボタン | `name`属性 + `values` | 指定値が選択された時に対象を表示 |
| プルダウン | `name`属性 + `values` | 指定値が選択された時に対象を表示 |
| ファイル | `#file_view_` + ID | ファイルがアップロードされた時に対象を表示 |
| 住所セット | `name`属性 + `-pf`/`-ct` | 都道府県・市区町村選択時に対象を表示 |

## 🔍 トラブルシューティング

### よくある問題

1. **要素が見つからない**
   - セレクターが正しいか確認
   - 要素がDOMに存在するか確認

2. **イベントが発火しない**
   - 住所セットの場合は `-pf`/`-ct` サフィックスを確認
   - 正規表現のエスケープを確認

3. **ビルドエラー**
   - `npm install` で依存関係を確認
   - TypeScriptエラーを確認

4. **テストが `Executable doesn't exist` で落ちる**
   - `npx playwright install chromium` を手動実行（通常は `npm run test` 内で自動解決）

## 📝 ライセンス

MIT License

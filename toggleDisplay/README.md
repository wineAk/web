# toggleDisplay

フォーム要素の表示・非表示を動的に切り替えるTypeScriptライブラリです。

## 🚀 機能

- ✅ 一行テキスト、複数行テキスト、チェックボックス、ラジオボタン、プルダウン対応
- ✅ ファイルアップロード、日付、数字、パスワード対応
- ✅ 住所セット（都道府県・市区町村）対応
- ✅ 必須項目の動的制御
- ✅ バージョン管理機能

## 📦 インストール

```bash
npm install
```

## 🔧 開発

```bash
# 開発用ビルド
npm run dev

# 本番用ビルド
npm run build

# バージョン更新
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

## 💻 使い方

### 基本的な使い方

```javascript
// 一行テキスト
toggleDisplay({
  source: {
    selector: "wf123456789",
  },
  targets: [
    { selector: "表示したい要素" },
    { selector: "wf987654321", required: true }
  ],
});

// チェックボックス
toggleDisplay({
  source: {
    selector: "wf123456789",
    values: ["A", "B"],
  },
  targets: [
    { selector: "チェックされた時表示" },
    { selector: "wf987654321", required: false }
  ],
});
```

### バージョン確認

```javascript
// ブラウザでバージョン確認
console.log(window.toggleDisplayVersion()); // "1.0.0"
```

## 📁 ファイル構成

```
toggleDisplay/
├── toggleDisplay.ts    # メインライブラリ
├── constants.ts        # 定数定義
├── utils.ts           # ユーティリティ関数
├── scripts/
│   └── update-version.js  # バージョン更新スクリプト
├── dist/
│   ├── toggleDisplay.js      # 開発用ビルド
│   └── toggleDisplay.min.js  # 本番用ビルド
└── package.json
```

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

3. **バージョンエラー**
   - `npm run version` を実行してバージョン情報を更新

## 📝 ライセンス

MIT License

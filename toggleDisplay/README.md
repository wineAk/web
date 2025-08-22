# toggleDisplay

フォーム要素の表示・非表示を動的に切り替えるTypeScriptライブラリです。

## 🚀 機能

- ✅ 一行テキスト、複数行テキスト、チェックボックス、ラジオボタン、プルダウン対応
- ✅ ファイルアップロード、日付、数字、パスワード対応
- ✅ 住所セット（都道府県・市区町村）対応
- ✅ 必須項目の動的制御
- ✅ バージョン管理機能（ビルド時自動挿入）
- ✅ 並列ビルド対応（開発用・本番用同時生成）

## 🔧 開発

### 📦 インストール

```bash
npm install
```

### ビルド

```bash
# 開発用・本番用ビルド（両方同時生成）
npm run dev
npm run build
```

## 💻 使い方

### CDN

``` html
<script src="https://wineak.github.io/web/toggleDisplay/dist/td.min.js"></script>
```

### 使い方

#### バージョン取得

```javascript
console.log( toggleDisplayVersion() ); // "1.0.0"
```

#### 基本的な使い方
```type
toggleDisplay({
  source: {
    selector: string,
  },
  targets: [
    {
      selector: string
      required: boolean
    },
  ],
});
```

#### 実際の使い方

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

## 📝 ライセンス

MIT License

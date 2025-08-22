const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// package.jsonからバージョンを取得
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// コマンドライン引数を解析（現在は使用しないが将来の拡張用に保持）
const args = process.argv.slice(2);

// バージョン情報を動的に挿入するプラグイン
const versionPlugin = {
  name: 'version-plugin',
  setup(build) {
    // ビルド開始時にバージョン情報を設定
    build.onStart(() => {
      console.log(`🚀 Building toggleDisplay v${version}...`);
    });

    // エントリーポイントの処理
    build.onLoad({ filter: /src\/index\.ts$/ }, async (args) => {
      let contents = await fs.promises.readFile(args.path, 'utf8');
      
      // プレースホルダーを実際のバージョンに置換
      contents = contents.replace(/\{\{VERSION\}\}/g, version);
      
      return {
        contents,
        loader: 'ts'
      };
    });

    // ビルド完了時の処理
    build.onEnd((result) => {
      if (result.errors.length === 0) {
        console.log(`✅ Build completed successfully!`);
        console.log(`📦 Version: v${version}`);
      }
    });
  }
};

// ビルド設定を生成する関数
function createBuildOptions(isMinify, outfile) {
  return {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile: outfile,
    plugins: [versionPlugin],
    minify: isMinify,
    sourcemap: !isMinify,
    target: ['es2015'],
    define: {
      'process.env.NODE_ENV': isMinify ? '"production"' : '"development"'
    }
  };
}

// ビルド実行
async function build() {
  try {
    // distディレクトリが存在しない場合は作成
    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // 開発用と本番用の両方をビルド
    const builds = [
      {
        name: 'Development',
        options: createBuildOptions(false, 'dist/td.js')
      },
      {
        name: 'Production',
        options: createBuildOptions(true, 'dist/td.min.js')
      }
    ];

    console.log(`🚀 Building toggleDisplay v${version}...`);
    
    // 並列でビルド実行
    const results = await Promise.allSettled(
      builds.map(build => esbuild.build(build.options))
    );

    // 結果をチェック
    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${builds[index].name} build completed`);
        successCount++;
      } else {
        console.error(`❌ ${builds[index].name} build failed:`, result.reason);
      }
    });

    if (successCount === builds.length) {
      console.log(`🎉 All builds completed successfully!`);
      console.log(`📦 Version: v${version}`);
      console.log(`📁 Outputs: dist/td.js, dist/td.min.js`);
    } else {
      console.error(`⚠️  ${builds.length - successCount} build(s) failed`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

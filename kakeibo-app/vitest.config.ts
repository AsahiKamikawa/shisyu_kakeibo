import { defineConfig } from 'vitest/config';

// ロジック中心のユニットテスト。PWA プラグインを読み込まないよう
// vite.config とは分離した最小構成にする。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
});

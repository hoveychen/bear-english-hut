/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  test: {
    /*
     * 特性开发在 <repo>/.worktrees/<id>/ 里的独立 checkout 进行，那里有一整份
     * src/ 的副本。默认 glob 会把它也扫进来，于是同一批测试跑两遍
     * （合并后第一次在 main 上跑就是 46 个而不是 23 个）——数字对不上事小，
     * 真正的风险是某个陈旧 worktree 里的旧测试挂了，却看不出是谁挂的。
     */
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**'],
  },
})

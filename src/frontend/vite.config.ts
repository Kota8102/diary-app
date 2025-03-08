import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    global: 'window', // global を window にマッピング
    Buffer: ['buffer', 'Buffer'], // Buffer をグローバルスコープに追加
    'process.env': process.env,
  },
  resolve: {
    alias: {
      // Node.js の buffer モジュールのポリフィル設定
      buffer: 'buffer',
      '@/src': '/src',
    },
  },
  server: {
    host: true,
  },
})

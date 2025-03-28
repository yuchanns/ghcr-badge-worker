import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import build from '@hono/vite-build/cloudflare-workers'

const entry = 'src/index.ts'

export default defineConfig({
  plugins: [
    devServer({
      adapter,
      entry,
    }),
    build({
      entry,
    }),
  ],
})

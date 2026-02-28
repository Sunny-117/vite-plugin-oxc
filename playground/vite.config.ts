import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [oxc()],
})

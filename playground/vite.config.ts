import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'
import inspect from 'vite-plugin-inspect'

// https://vite.dev/config/
export default defineConfig({
  plugins: [oxc(), inspect()],
  build: {
    // Disable Vite's built-in minification to use oxc-minify
    minify: false,
    sourcemap: true,
  },
})

import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [oxc({ minify: true, sourcemap: true })],
  build: {
    // Disable Vite's built-in minification to use oxc-minify
    minify: false,
    sourcemap: true,
  },
})

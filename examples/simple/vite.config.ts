import { defineConfig } from 'vite'
import vitePluginOxc from '../../dist/index.js'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      // Basic TypeScript transformation
      transform: {
        typescript: {
          declaration: {
            stripInternal: false,
          },
        },
      },
      // Disable minify for now to isolate issues
      minify: false,
      sourcemap: true,
    }),
  ],
  build: {
    target: 'es2020',
  },
})

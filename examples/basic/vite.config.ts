import { defineConfig } from 'vite'
import vitePluginOxc from 'vite-plugin-oxc'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      // Transform TypeScript and JSX
      transform: {
        jsx: {
          runtime: 'classic', // Use React 17+ automatic JSX runtime
        },
      },
      resolve: false,
      // Enable minification in production
      minify: true,
      // Enable source maps
      sourcemap: true,
    }),
    inspect()
  ],
  build: {
    target: 'es2020',
    minify: false, // Let oxc handle minification
  },
})

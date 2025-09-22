import { defineConfig } from 'vite'
import vitePluginOxc from '../../dist/index.js'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      // Transform TypeScript and JSX
      transform: {
        jsx: {
          runtime: 'automatic', // Use React 17+ automatic JSX runtime
        },
      },
      resolve: false,
      // Enable minification in production
      minify: true,
      // Enable source maps
      sourcemap: true,
    }),
  ],
  build: {
    target: 'es2020',
    minify: false, // Let oxc handle minification
  },
})

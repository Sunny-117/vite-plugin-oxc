import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    react(),
    // vitePluginOxc({
    //   // Transform TypeScript and JSX
    //   transform: {
    //     jsx: {
    //       runtime: 'classic', // Use React 17+ automatic JSX runtime
    //     },
    //   },
    //   resolve: false,
    //   // Enable minification in production
    //   minify: true,
    //   // Enable source maps
    //   sourcemap: true,
    // }),
    inspect()
  ],
  build: {
    target: 'es2020',
    minify: false, // Let oxc handle minification
  },
})

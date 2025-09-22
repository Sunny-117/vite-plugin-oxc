import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    oxc({
      // Transform TypeScript and JSX
      transform: {
        jsx: {
          runtime: 'automatic', // Use React 17+ automatic JSX runtime
        },
        typescript: {
          declaration: false,
        },
      },
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

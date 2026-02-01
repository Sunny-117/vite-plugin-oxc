import { defineConfig } from 'vite'
import vitePluginOxc from '../../dist/index.js'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      // Enable basic TypeScript transformation
      transform: {},
      resolve: false,
      minify: false,
      sourcemap: true,
    }) as any, // Type assertion to fix Vite version compatibility
  ],
  build: {
    target: 'es2020',
  },
})

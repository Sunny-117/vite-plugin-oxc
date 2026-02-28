import { defineConfig } from 'robuild'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  dts: true,
  external: ['vite', 'oxc-transform', 'oxc-resolver', 'oxc-minify'],
  exports: {
    enabled: true
  }
})

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  external: ['vite', 'oxc-transform', 'oxc-resolver', 'oxc-minify'],
  target: 'node18',
})

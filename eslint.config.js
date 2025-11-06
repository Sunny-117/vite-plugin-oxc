import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: [
    'dist',
    'node_modules',
    'coverage',
    '*.config.js',
    '*.config.ts',
    'build.config.ts',
    'src/useResource/**',
    'example/**',
    'playground/**',
  ],
  rules: {
    // 自定义规则
    'no-console': 'warn',
    'prefer-const': 'error',
    'ts/explicit-function-return-type': 'off',
    'node/prefer-global/process': 'off',
    'prefer-promise-reject-errors': 'off',
    'style/multiline-ternary': 'off',
  },
})
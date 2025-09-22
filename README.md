# vite-plugin-oxc

🚀 **Blazing Fast** Oxc integration for Vite - Transform, resolve, and minify your code with the power of Rust.

## Features

- 🚀 **Blazing Fast**: Transform, resolve, and minify files with Oxc, built in Rust
- 🦾 **Powerful**: Supports TypeScript and React JSX transformation, identifier replacement, syntax lowering, and more
- 📦 **Zero Config**: No configuration needed for TypeScript support
- 🎨 **Customizable**: Fine-tune transform, resolve, and minify options
- 🔧 **Vite Focused**: Designed specifically for Vite with optimal integration

## Installation

```bash
npm i -D vite-plugin-oxc
# or
pnpm add -D vite-plugin-oxc
# or
yarn add -D vite-plugin-oxc
```

## Usage

### Basic Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [oxc()],
})
```

### Advanced Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    oxc({
      // Files to include (default: /\.[cm]?[jt]sx?$/)
      include: [/\.[jt]sx?$/],

      // Files to exclude (default: /node_modules/)
      exclude: [/node_modules/, /\.spec\./],

      // Plugin enforcement (default: undefined)
      enforce: 'pre',

      // Transform options
      transform: {
        jsx: {
          runtime: 'automatic', // React 17+ automatic JSX runtime
          pragma: 'h', // Custom JSX pragma
        },
        typescript: {
          declaration: false,
        },
        // Enable syntax lowering
        target: 'es2020',
      },

      // Resolve options
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        conditionNames: ['import', 'module', 'default'],
      },

      // Enable resolving node_modules (default: false)
      resolveNodeModules: false,

      // Minify options (default: false)
      minify: {
        compress: true,
        mangle: true,
      },

      // Source map generation (default: true in dev, false in prod)
      sourcemap: true,
    }),
  ],
  build: {
    target: 'es2020',
    minify: false, // Let oxc handle minification
  },
})
```

## Options

### `include`
- **Type**: `FilterPattern`
- **Default**: `[/\.[cm]?[jt]sx?$/]`

Files to include for transformation.

### `exclude`
- **Type**: `FilterPattern`
- **Default**: `[/node_modules/]`

Files to exclude from transformation.

### `enforce`
- **Type**: `'pre' | 'post' | undefined`
- **Default**: `undefined`

Plugin enforcement order.

### `transform`
- **Type**: `TransformOptions | false`
- **Default**: `{}`

Transform options passed to `oxc-transform`. Set to `false` to disable transformation.

### `resolve`
- **Type**: `NapiResolveOptions | false`
- **Default**: `{}`

Resolve options passed to `oxc-resolver`. Set to `false` to disable custom resolution.

### `resolveNodeModules`
- **Type**: `boolean`
- **Default**: `false`

Whether to resolve node_modules. The plugin skips resolving node_modules by default for performance.

### `minify`
- **Type**: `MinifyOptions | boolean`
- **Default**: `false`

Minify options passed to `oxc-minify`. Set to `true` for default minification or `false` to disable.

### `sourcemap`
- **Type**: `boolean`
- **Default**: `true` in development, `false` in production

Enable source map generation.

## Examples

### React with TypeScript

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    oxc({
      transform: {
        jsx: {
          runtime: 'automatic',
        },
        typescript: {
          declaration: false,
        },
      },
      minify: true,
    }),
  ],
})
```

### Custom JSX (Preact)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    oxc({
      transform: {
        jsx: {
          runtime: 'classic',
          pragma: 'h',
          pragmaFrag: 'Fragment',
        },
      },
    }),
  ],
})
```

### Production Optimization

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import oxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    oxc({
      transform: {
        target: 'es2020',
      },
      minify: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
      },
      sourcemap: false,
    }),
  ],
  build: {
    minify: false, // Let oxc handle minification
  },
})
```

## Performance

This plugin leverages Oxc's Rust-based toolchain for maximum performance:

- **Transform**: Up to 20x faster than TypeScript compiler
- **Resolve**: Faster module resolution with caching
- **Minify**: Competitive with the fastest JavaScript minifiers

## Comparison with unplugin-oxc

This plugin is focused specifically on Vite, while `unplugin-oxc` supports multiple bundlers. Choose this plugin if:

- You're only using Vite
- You want optimal Vite integration
- You prefer a focused, lightweight solution

Choose `unplugin-oxc` if:
- You need support for multiple bundlers (Webpack, Rollup, etc.)
- You want a universal solution

## License

MIT

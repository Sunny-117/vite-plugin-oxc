# Examples

This directory contains example projects demonstrating how to use vite-plugin-oxc.

## Available Examples

### 1. Simple TypeScript Example (`simple/`)

A minimal example showing basic TypeScript transformation with vite-plugin-oxc.

**Features:**
- TypeScript compilation using oxc-transform
- Modern JavaScript features (optional chaining, nullish coalescing)
- Source maps enabled

**To run:**
```bash
cd examples/simple
npm install
npm run dev    # Start development server
npm run build  # Build for production
```

### 2. React + TypeScript Example (`basic/`)

A React application with TypeScript and JSX transformation using vite-plugin-oxc.

**Features:**
- React 18 with TypeScript
- JSX transformation with automatic runtime
- React hooks and modern patterns
- Production minification with oxc-minify

**To run:**
```bash
cd examples/basic
npm install
npm run dev    # Start development server
npm run build  # Build for production
```

## Configuration Examples

### Basic Configuration (TypeScript only)
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vitePluginOxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      transform: {},  // Enable TypeScript transformation
      resolve: false, // Disable custom resolution
      minify: false,  // Disable minification in dev
      sourcemap: true,
    }),
  ],
})
```

### React Configuration
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vitePluginOxc from 'vite-plugin-oxc'

export default defineConfig({
  plugins: [
    vitePluginOxc({
      transform: {
        jsx: {
          runtime: 'automatic', // React 17+ automatic JSX runtime
        },
      },
      resolve: false,
      minify: true,     // Enable minification in production
      sourcemap: true,
    }),
  ],
  build: {
    minify: false, // Let oxc handle minification
  },
})
```

## Performance Comparison

The examples demonstrate the performance benefits of using oxc-transform over the default TypeScript compiler:

- **TypeScript compilation**: Up to 20x faster than tsc
- **JSX transformation**: Significantly faster than Babel
- **Bundle size**: Optimized output with oxc-minify

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Make sure to disable custom resolution (`resolve: false`) if you encounter issues
2. **TypeScript errors**: The plugin uses oxc-transform which may have slightly different behavior than tsc
3. **JSX issues**: Ensure you're using the correct JSX runtime configuration

### Getting Help

If you encounter issues with the examples:

1. Check the console for detailed error messages
2. Try disabling features one by one to isolate the problem
3. Refer to the main README.md for configuration options
4. Open an issue on GitHub with a minimal reproduction case

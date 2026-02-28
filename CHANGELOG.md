# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.4

[compare changes](https://github.com/Sunny-117/vite-plugin-oxc/compare/v0.0.3...v0.0.4)

### 🚀 Enhancements

- Unit test ([4651204](https://github.com/Sunny-117/vite-plugin-oxc/commit/4651204))
- Support a table row visibility monitoring feature ([ccddaf5](https://github.com/Sunny-117/vite-plugin-oxc/commit/ccddaf5))
- Implement oxc-minify in generateBundle hook with sourcemap merging ([ce60c72](https://github.com/Sunny-117/vite-plugin-oxc/commit/ce60c72))
- Add React Fast Refresh HMR support ([01883b7](https://github.com/Sunny-117/vite-plugin-oxc/commit/01883b7))
- Use oxc for JSX/TSX transformation instead of esbuild ([58be935](https://github.com/Sunny-117/vite-plugin-oxc/commit/58be935))

### 🩹 Fixes

- Adapt to oxc async API changes for playground build ([75c9c46](https://github.com/Sunny-117/vite-plugin-oxc/commit/75c9c46))
- Update tests for enforce:'pre' default and fix override logic ([f660144](https://github.com/Sunny-117/vite-plugin-oxc/commit/f660144))

### 📖 Documentation

- ✏️ package.json ([7428f7f](https://github.com/Sunny-117/vite-plugin-oxc/commit/7428f7f))

### 🏡 Chore

- **release:** V1.0.1 ([41d156f](https://github.com/Sunny-117/vite-plugin-oxc/commit/41d156f))
- 🤖 lock update ([3759f6a](https://github.com/Sunny-117/vite-plugin-oxc/commit/3759f6a))
- 🤖 bundle @huse/request ([78c0366](https://github.com/Sunny-117/vite-plugin-oxc/commit/78c0366))
- Deprecated ([6b681cc](https://github.com/Sunny-117/vite-plugin-oxc/commit/6b681cc))
- Add playground ([ed770b4](https://github.com/Sunny-117/vite-plugin-oxc/commit/ed770b4))
- Claude config ([55b857e](https://github.com/Sunny-117/vite-plugin-oxc/commit/55b857e))
- **release:** V0.0.3 ([e17dec7](https://github.com/Sunny-117/vite-plugin-oxc/commit/e17dec7))
- Switch from tsup to robuild for building ([b544f2c](https://github.com/Sunny-117/vite-plugin-oxc/commit/b544f2c))
- Update configs and add react-refresh dependency ([9db8726](https://github.com/Sunny-117/vite-plugin-oxc/commit/9db8726))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.3

[compare changes](https://github.com/Sunny-117/vite-plugin-oxc/compare/v0.0.3...v0.0.3)

### 🚀 Enhancements

- Unit test ([4651204](https://github.com/Sunny-117/vite-plugin-oxc/commit/4651204))
- Support a table row visibility monitoring feature ([ccddaf5](https://github.com/Sunny-117/vite-plugin-oxc/commit/ccddaf5))

### 🩹 Fixes

- Adapt to oxc async API changes for playground build ([75c9c46](https://github.com/Sunny-117/vite-plugin-oxc/commit/75c9c46))

### 📖 Documentation

- ✏️ package.json ([7428f7f](https://github.com/Sunny-117/vite-plugin-oxc/commit/7428f7f))

### 🏡 Chore

- **release:** V1.0.1 ([41d156f](https://github.com/Sunny-117/vite-plugin-oxc/commit/41d156f))
- 🤖 lock update ([3759f6a](https://github.com/Sunny-117/vite-plugin-oxc/commit/3759f6a))
- 🤖 bundle @huse/request ([78c0366](https://github.com/Sunny-117/vite-plugin-oxc/commit/78c0366))
- Deprecated ([6b681cc](https://github.com/Sunny-117/vite-plugin-oxc/commit/6b681cc))
- Add playground ([ed770b4](https://github.com/Sunny-117/vite-plugin-oxc/commit/ed770b4))
- Claude config ([55b857e](https://github.com/Sunny-117/vite-plugin-oxc/commit/55b857e))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## v0.0.2


### 🚀 Enhancements

- Vite oxc plugin ([79cedf0](https://github.com/Sunny-117/vite-plugin-oxc/commit/79cedf0))
- Playground ([f5a2a77](https://github.com/Sunny-117/vite-plugin-oxc/commit/f5a2a77))

### 🩹 Fixes

- Types ([226b981](https://github.com/Sunny-117/vite-plugin-oxc/commit/226b981))
- Scripts ([29bb5cd](https://github.com/Sunny-117/vite-plugin-oxc/commit/29bb5cd))

### 🏡 Chore

- Release ([56fae19](https://github.com/Sunny-117/vite-plugin-oxc/commit/56fae19))
- Add changelogen ([bd7ba41](https://github.com/Sunny-117/vite-plugin-oxc/commit/bd7ba41))

### ❤️ Contributors

- Sunny-117 <zhiqiangfu6@gmail.com>

## [0.1.1] - 2025-01-22

### Changed
- Updated all dependencies to latest versions
- Added support for Vite 7.x
- Updated peer dependencies to support Vite 4.x - 7.x
- Updated TypeScript to 5.6.x
- Updated Node.js types to v22
- Updated ESLint and related packages to latest versions

### Fixed
- Resolved TypeScript type compatibility issues between different Vite versions
- Fixed module resolution conflicts in examples

## [0.1.0] - 2025-01-22

### Added
- Initial release of vite-plugin-oxc
- TypeScript and JSX transformation using oxc-transform
- Module resolution using oxc-resolver
- Code minification using oxc-minify
- Configurable include/exclude patterns
- Source map support
- Comprehensive TypeScript types
- Unit tests with vitest
- Example configuration for React projects
- Complete documentation with usage examples

### Features
- 🚀 **Blazing Fast**: Transform, resolve, and minify files with Oxc, built in Rust
- 🦾 **Powerful**: Supports TypeScript and React JSX transformation, identifier replacement, syntax lowering, and more
- 📦 **Zero Config**: No configuration needed for TypeScript support
- 🎨 **Customizable**: Fine-tune transform, resolve, and minify options
- 🔧 **Vite Focused**: Designed specifically for Vite with optimal integration

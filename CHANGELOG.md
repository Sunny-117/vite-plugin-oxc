# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

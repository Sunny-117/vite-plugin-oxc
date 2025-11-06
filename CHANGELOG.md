# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-11-06

### Added
- Complete TypeScript support with comprehensive type definitions
- JSDoc documentation for all hooks with usage examples
- Comprehensive test suite with 90%+ coverage using Vitest
- ESLint configuration with @antfu/eslint-config
- Prettier configuration for consistent code formatting
- Contributing guidelines and development setup instructions

### Enhanced
- `useBoolean` - Boolean state management with convenient actions
- `useToggle` - Toggle between two values with type safety
- `useCounter` - Numeric counter with min/max constraints
- `useMap` - Map state management with CRUD operations
- `useLatest` - Always get the latest value reference
- `useMemoizedFn` - Memoized function with persistent reference
- `useSetState` - Object state with automatic merging
- `useUnmount` - Execute cleanup on component unmount

### Fixed
- All ESLint warnings and errors
- Type safety improvements across all hooks
- Consistent code formatting and style

### Documentation
- Complete README with API documentation
- Usage examples for all hooks
- Installation and setup instructions
- Contributing guidelines

## [1.0.0] - 2024-11-06

### Added
- Initial release with core React hooks
- Basic TypeScript support
- Build configuration with robuild
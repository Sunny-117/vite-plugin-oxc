# Contributing to use-react-core

Thank you for your interest in contributing to use-react-core! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Start development: `pnpm dev`

## Project Structure

```
src/
├── index.ts              # Main entry point
├── useHookName/          # Individual hook directory
│   └── index.ts          # Hook implementation
└── utils/                # Shared utilities
```

## Adding a New Hook

1. Create a new directory under `src/` with your hook name
2. Implement the hook in `index.ts` with proper TypeScript types
3. Add JSDoc comments with examples
4. Export the hook from `src/index.ts`
5. Write comprehensive tests
6. Update README.md with documentation

## Code Standards

- Use TypeScript for all code
- Follow existing code style (Prettier + ESLint)
- Write JSDoc comments for all public APIs
- Include usage examples in JSDoc
- Ensure 90%+ test coverage

## Testing

- Run tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Coverage: `pnpm test:coverage`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code standards
3. Add tests for new functionality
4. Update documentation
5. Ensure all tests pass and linting is clean
6. Submit a pull request with a clear description

## Commit Convention

We use conventional commits. Examples:
- `feat: add useLocalStorage hook`
- `fix: resolve memory leak in useInterval`
- `docs: update README with new examples`
- `test: add tests for useToggle hook`
# use-react-core

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

📦️ A high-quality & reliable React Hooks library built with TypeScript.

## ✨ Features

- 🔥 **High Quality**: Written in TypeScript with comprehensive type definitions
- 🚀 **Performance**: Optimized for performance with minimal re-renders
- 📦 **Tree Shakable**: Only import what you need
- 🧪 **Well Tested**: 90%+ test coverage with comprehensive test suites
- 📖 **Great Documentation**: Detailed documentation with examples
- 🎯 **React 18 Ready**: Full support for React 18 features

## 📦 Installation

```bash
npm install use-react-core
# or
yarn add use-react-core
# or
pnpm add use-react-core
```

## 🚀 Quick Start

```tsx
import { useBoolean, useCounter, useToggle } from 'use-react-core';

function App() {
  const [isVisible, { toggle, setTrue, setFalse }] = useBoolean(false);
  const [count, { inc, dec, reset }] = useCounter(0, { min: 0, max: 10 });
  const [theme, { toggle: toggleTheme }] = useToggle('light', 'dark');

  return (
    <div>
      <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
      <button onClick={toggle}>Toggle Visibility</button>
      
      <p>Count: {count}</p>
      <button onClick={() => inc()}>+1</button>
      <button onClick={() => dec()}>-1</button>
      
      <p>Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 📚 Hooks

### State Management

- [`useBoolean`](#useboolean) - Manage boolean state with convenient actions
- [`useToggle`](#usetoggle) - Toggle between two values
- [`useCounter`](#usecounter) - Manage numeric counter with constraints
- [`useMap`](#usemap) - Manage Map state with actions
- [`useSetState`](#usesetstate) - Manage object state with automatic merging

### Storage

- [`useLocalStorageState`](#uselocalstoragestate) - Sync state with localStorage
- [`useSessionStorageState`](#usesessionstoragestate) - Sync state with sessionStorage
- [`useCookieState`](#usecookiestate) - Sync state with cookies
- [`useUrlState`](#useurlstate) - Sync state with URL parameters

### Performance

- [`useLatest`](#uselatest) - Get the latest value without re-creating functions
- [`useMemoizedFn`](#usememoizedfn) - Memoize function with persistent reference

### Lifecycle

- [`useUnmount`](#useunmount) - Execute function on component unmount

### Async

- [`useCancelableAsyncTaskCallback`](#usecancelableasynctaskcallback) - Handle cancelable async operations

---

## API Reference

### useBoolean

Manage boolean state with convenient actions.

```tsx
const [state, { setTrue, setFalse, toggle, set }] = useBoolean(initialValue);
```

**Parameters:**
- `initialValue?: boolean` - Initial boolean value (default: `false`)

**Returns:**
- `state: boolean` - Current boolean state
- `actions: object` - Actions to manipulate the state
  - `setTrue: () => void` - Set state to `true`
  - `setFalse: () => void` - Set state to `false`
  - `toggle: () => void` - Toggle the state
  - `set: (value: boolean) => void` - Set state to specific value

### useToggle

Toggle between two values.

```tsx
const [state, { toggle, set, setLeft, setRight }] = useToggle(defaultValue, reverseValue);
```

**Parameters:**
- `defaultValue?: T` - Initial value (default: `false`)
- `reverseValue?: U` - Alternative value (default: `!defaultValue`)

**Returns:**
- `state: T | U` - Current state
- `actions: object` - Actions to manipulate the state

### useCounter

Manage numeric counter with optional constraints.

```tsx
const [count, { inc, dec, set, reset }] = useCounter(initialValue, options);
```

**Parameters:**
- `initialValue?: number` - Initial count (default: `0`)
- `options?: { min?: number; max?: number }` - Constraints

**Returns:**
- `count: number` - Current count
- `actions: object` - Actions to manipulate the counter

### useMap

Manage Map state with convenient actions.

```tsx
const [map, { set, get, remove, reset, setAll }] = useMap(initialValue);
```

### useLatest

Get the latest value without dependencies.

```tsx
const latestValueRef = useLatest(value);
```

### useMemoizedFn

Memoize function with persistent reference.

```tsx
const memoizedFn = useMemoizedFn(fn);
```

### useUnmount

Execute function on component unmount.

```tsx
useUnmount(() => {
  // cleanup logic
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

[MIT](./LICENSE.md) License © 2024-PRESENT [Sunny-117](https://github.com/Sunny-117)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/use-react-core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/use-react-core
[npm-downloads-src]: https://img.shields.io/npm/dm/use-react-core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/use-react-core
[bundle-src]: https://img.shields.io/bundlephobia/minzip/use-react-core?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=use-react-core
[license-src]: https://img.shields.io/github/license/Sunny-117/use-react-core.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/Sunny-117/use-react-core/blob/main/LICENSE.md
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/use-react-core

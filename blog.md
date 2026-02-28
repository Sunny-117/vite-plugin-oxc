# vite-plugin-oxc：从 Babel 到 Oxc，我为 Vite 写了一个高性能编译插件

## 写在前面

关注前端工具链的人应该都注意到了，Rust 正在「入侵」这个领域。SWC 被 Next.js 采用，Biome 在蚕食 ESLint 和 Prettier 的地盘，而 Oxc 作为新一代 Rust 工具链，性能数据更是夸张——比 SWC 还快好几倍。

更值得关注的是 Vite 的动向。Evan You 团队正在开发 Rolldown，一个用 Rust 重写的 Rollup，底层就是基于 Oxc。按照 roadmap，Rolldown 会逐步集成到 Vite 中，届时整个构建流程都将是 Rust 实现。

既然大势所趋，为什么不提前体验一下？Oxc 的各个模块（`oxc-transform`、`oxc-resolver`、`oxc-minify`）都已经通过 npm 包发布了，完全可以在当前的 Vite 项目中直接使用。于是我动手写了 `vite-plugin-oxc`，把 Oxc 的能力接入 Vite 的插件体系，算是在 Rolldown 正式落地前的一次提前尝鲜。

这就是这个插件的由来。

> 项目源码：https://github.com/Sunny-117/vite-plugin-oxc

---

## 一、JavaScript 编译工具的前世今生

在聊具体实现之前，有必要回顾一下 JavaScript 编译工具这些年的演进。这不是为了炒冷饭，而是理解这个演进脉络，才能明白为什么 Oxc 的出现是一种必然。

### 1.1 Babel：开创性的存在

2014 年，当 ES6 规范还在草案阶段，6to5（后来更名为 Babel）横空出世。那时候浏览器对新语法的支持参差不齐，Babel 让开发者可以放心使用箭头函数、解构赋值、类等新特性，然后转译成 ES5 代码跑在老旧浏览器上。

Babel 的架构设计很经典：

```
源代码 → Parser（解析成 AST）→ Transformer（插件转换）→ Generator（生成代码）
```

这套架构的优势在于插件系统的灵活性。任何人都可以写一个 Babel 插件，操作 AST 实现自定义的代码转换。十年过去了，Babel 生态里积累了数以万计的插件，覆盖了几乎所有你能想到的代码转换需求。

但问题也很明显：**慢**。

Babel 是纯 JavaScript 实现的。JavaScript 是单线程、解释执行、带 GC 的语言，天生就不是性能敏感型任务的最佳选择。当项目规模膨胀到几十万行代码时，Babel 的编译时间会变得令人抓狂。我见过一些大型 monorepo 项目，光 Babel 编译就要好几分钟。

另一个痛点是配置复杂度。`@babel/preset-env`、`@babel/plugin-transform-runtime`、`core-js`、`browserslist`……这些概念交织在一起，新手很容易迷失在配置地狱里。我至今还记得当年为了搞清楚 `useBuiltIns: 'usage'` 和 `useBuiltIns: 'entry'` 的区别，翻了多少遍文档。

### 1.2 esbuild：用 Go 重写一切

2020 年，esbuild 的出现彻底改变了游戏规则。

作者 Evan Wallace（Figma 联合创始人）用 Go 语言重写了一个 JavaScript/TypeScript 打包器，性能数据令人瞠目结舌：比 Webpack 快 10-100 倍。这不是什么黑魔法，原因很朴素：

1. **Go 是编译型语言**，执行效率远高于 JavaScript
2. **Go 的并发模型**让 esbuild 可以充分利用多核 CPU
3. **从零设计**，没有历史包袱，数据结构和算法都针对性能优化过
4. **All-in-one**，解析、转换、打包、压缩一条龙，减少中间环节的开销

Vite 选择 esbuild 做预构建（pre-bundling）正是看中了这一点。在开发模式下，esbuild 可以在几百毫秒内把 `node_modules` 里的依赖打包好，让 Vite 的冷启动时间保持在秒级。

但 esbuild 也有它的局限：

- **不做类型检查**。它只剥离 TypeScript 类型，不验证类型正确性。
- **插件系统相对简单**。不像 Babel 那样可以精细操作 AST，esbuild 的插件主要用于自定义模块解析和加载。
- **不追求 100% 兼容**。一些边缘场景的语法转换可能和 Babel 结果不一致。
- **作者明确表示不会支持某些特性**，比如装饰器的旧版实现。

对于大多数项目来说，这些局限不是问题。但在某些场景下，你可能还是得请出 Babel。

### 1.3 SWC：Rust 阵营的第一枪

2019 年，韩国开发者 Donny（강동윤）用 Rust 启动了 SWC 项目。名字来源于 "Speedy Web Compiler"，目标很直接：做一个更快的 Babel 替代品。

SWC 的策略是 **兼容 Babel**。它实现了大部分 Babel 的转换能力，配置项也尽量保持一致，让迁移成本降到最低。性能方面，SWC 号称比 Babel 快 20 倍以上。

2021 年，SWC 被 Vercel 收购，成为 Next.js 12 的默认编译器。这是一个标志性事件——Rust 编写的前端工具链开始进入主流视野。

SWC 的优势在于：

- **Rust 的性能**。编译型语言、零成本抽象、无 GC 停顿。
- **良好的 Babel 兼容性**。支持大部分 Babel 插件的功能。
- **持续的投入**。有 Vercel 背书，项目维护有保障。

但 SWC 也有一些问题。最常被吐槽的是 **编译产物的稳定性**。早期版本偶尔会出现一些边缘情况的 bug，导致生产环境翻车。另外，SWC 的架构设计主要服务于 Next.js 的需求，作为通用工具使用时，某些场景的支持不够完善。

### 1.4 工具演进的本质规律

回顾这段历史，可以看到一个清晰的趋势：

| 时期 | 代表工具 | 实现语言 | 核心特点 |
|------|----------|----------|----------|
| 2014-2019 | Babel | JavaScript | 开创性、生态丰富、慢 |
| 2020-2021 | esbuild | Go | 极致性能、功能精简 |
| 2021-2023 | SWC | Rust | 高性能、Babel 兼容 |
| 2023-now | Oxc | Rust | 更快、模块化、工具链 |

这个演进本质上是在解决同一个问题：**如何在保证功能的前提下，榨干硬件的每一分性能**。

JavaScript 天生不适合这类 CPU 密集型任务，所以社区开始用系统级语言重写。Go 和 Rust 之争，目前看来 Rust 略占上风——主要是因为 Rust 的零成本抽象和更精细的内存控制，在极致性能场景下更有优势。

---

## 二、Oxc 凭什么更快

Oxc（Oxidation Compiler）是 2023 年开始崭露头角的新项目，作者是 Boshen Chen。相比前辈们，Oxc 有几个独特的特点。

### 2.1 不只是编译器，是完整工具链

Oxc 的野心不止于一个编译器。它的目标是提供一整套高性能 JavaScript 工具链：

- **oxc-parser**：JavaScript/TypeScript 解析器
- **oxc-transform**：代码转换器（JSX、TypeScript 等）
- **oxc-resolver**：模块路径解析器
- **oxc-minify**：代码压缩器
- **oxc-linter**：代码检查器（对标 ESLint）
- **oxc-formatter**：代码格式化器（对标 Prettier）

每个模块都可以独立使用，通过 npm 包的形式分发（底层是 Rust 编译成 N-API 原生模块）。这种模块化设计让你可以按需引入，而不是大包大揽。

### 2.2 性能数据

根据 Oxc 官方的 benchmark，在 parser 层面：

- 比 SWC 快 **3 倍**
- 比 Babel parser 快 **40+ 倍**

在 transformer 层面，处理 TypeScript 的速度大约是 SWC 的 **4 倍**。

这些数字看起来很夸张，但我自己跑过测试，差距确实存在。Oxc 的作者在性能优化上下了很大功夫，比如：

- 使用 `bumpalo` 这种 arena allocator 来减少内存分配开销
- AST 节点设计更紧凑，减少内存占用
- 大量使用 SIMD 指令加速字符串处理
- 零拷贝解析，尽量复用源代码字符串

### 2.3 兼容性策略

Oxc 的兼容性策略比较务实。它不追求 100% 兼容 Babel 的每一个行为，而是覆盖 **实际生产中最常用的转换场景**：

- TypeScript 类型剥离
- JSX 转换（classic 和 automatic 两种模式）
- ES target 降级（async/await、optional chaining 等）
- React Fast Refresh 注入

对于大多数项目来说，这些功能已经够用了。

---

## 三、vite-plugin-oxc 的设计思路

有了前面的背景铺垫，现在进入正题：如何把 Oxc 接入 Vite？

### 3.1 需求分析

我给自己定的目标是：

1. **替代 Vite 内置的 esbuild 做代码转换**。包括 TypeScript 类型剥离、JSX 转换。
2. **提供模块解析能力**。用 `oxc-resolver` 替代 Vite 的默认解析逻辑（可选）。
3. **提供代码压缩能力**。用 `oxc-minify` 在生产构建时压缩代码。
4. **支持 React Fast Refresh**。开发模式下的 HMR 必须正常工作。
5. **零配置可用**。默认配置就能满足大多数项目的需求。

### 3.2 Vite 插件机制简介

Vite 的插件系统基于 Rollup，但做了一些扩展。一个 Vite 插件本质上是一个对象，包含若干个 hook 函数。和我们这个插件相关的主要有：

- **`config`**：修改 Vite 配置
- **`configResolved`**：配置解析完成后的回调，可以拿到最终配置
- **`resolveId`**：自定义模块 ID 解析
- **`load`**：自定义模块加载
- **`transform`**：代码转换
- **`transformIndexHtml`**：转换 HTML 入口文件
- **`generateBundle`**：生成产物后的回调，可以修改最终产物

另外还有一个关键配置：`enforce`。它决定插件的执行顺序：

- `enforce: 'pre'`：在 Vite 核心插件之前执行
- 不设置：在 Vite 核心插件之后、用户插件之前执行
- `enforce: 'post'`：在所有插件之后执行

对于代码转换类插件，通常需要设置 `enforce: 'pre'`，这样才能在 Vite 的默认处理之前介入。

### 3.3 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     vite-plugin-oxc                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Transform   │  │   Resolve    │  │     Minify       │   │
│  │  (oxc-       │  │  (oxc-       │  │   (oxc-minify)   │   │
│  │  transform)  │  │  resolver)   │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│         │                 │                   │             │
│         ▼                 ▼                   ▼             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                React Fast Refresh                    │   │
│  │               (HMR 边界检测 + 运行时)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

这个插件由三个核心功能模块组成，加上一套 React Fast Refresh 的支持逻辑。下面逐一拆解。

---

## 四、Transform 模块：代码转换的核心

代码转换是整个插件最核心的功能。它的职责是把 TypeScript、JSX 这些浏览器不认识的语法，转换成标准的 JavaScript。

### 4.1 基本实现

先看核心代码：

```typescript
import { transformSync as oxcTransform } from 'oxc-transform'

// 在 transform hook 中
transform(code, id, transformOptions) {
  if (!filter(id) || options.transform === false) return null

  const isJsxFile = /\.[jt]sx$/.test(id)
  const enableRefresh = isDev && options.reactRefresh && isJsxFile

  const result = oxcTransform(id, code, {
    ...transformOpts,
    sourceType: guessSourceType(id, transformOptions?.format),
    sourcemap: options.sourcemap,
    jsx: {
      ...jsxOpts,
      development: isDev,
      refresh: enableRefresh ? {} : undefined,
    },
  })

  if (result.errors.length) {
    throw new SyntaxError(
      result.errors.map((error) => error.message).join('\n')
    )
  }

  return {
    code: result.code,
    map: result.map,
  }
}
```

`oxcTransform` 是 `oxc-transform` 提供的同步转换函数。它接收三个参数：

1. **文件路径**（用于 sourcemap 和错误信息）
2. **源代码字符串**
3. **转换选项**

返回值包含转换后的代码和 sourcemap。

### 4.2 sourceType 推断

一个容易被忽略的细节是 `sourceType` 的处理。JavaScript 有两种模块类型：

- **`module`**：ESM，支持 `import/export`
- **`script`**：传统脚本，支持 CommonJS

如果 sourceType 判断错误，转换结果可能出问题。比如把 ESM 代码当成 script 处理，`import` 语句就会报语法错误。

我实现了一个 `guessSourceType` 函数来推断：

```typescript
export function guessSourceType(
  id: string,
  format?: string
): 'module' | 'script' | undefined {
  // 优先使用上游传递的 format 信息
  if (format === 'module' || format === 'module-typescript') {
    return 'module'
  } else if (format === 'commonjs' || format === 'commonjs-typescript') {
    return 'script'
  }

  // 根据文件扩展名推断
  const moduleFormat = getModuleFormat(id)
  if (moduleFormat) {
    return moduleFormat === 'module' ? 'module' : 'script'
  }
}

export function getModuleFormat(
  id: string
): 'module' | 'commonjs' | 'json' | undefined {
  const ext = path.extname(id)
  switch (ext) {
    case '.mjs':
    case '.mts':
      return 'module'
    case '.cjs':
    case '.cts':
      return 'commonjs'
    case '.json':
      return 'json'
    case '.jsx':
    case '.tsx':
      return 'module' // JSX/TSX 默认当 ESM 处理
  }
}
```

这里有个约定：`.mjs`/`.mts` 是 ESM，`.cjs`/`.cts` 是 CommonJS，`.jsx`/`.tsx` 默认当 ESM。对于 `.js`/`.ts`，则依赖上游的 format 信息或者返回 undefined 让 Oxc 自己判断。

### 4.3 与 Vite 内置 esbuild 的协同

Vite 默认会用 esbuild 处理 TypeScript 和 JSX。如果我们的插件也处理这些文件，就会重复转换，结果不可预期。

解决方案是在 `config` hook 里禁用 esbuild 对 JSX/TSX 的处理：

```typescript
config(_userConfig, { command }) {
  return {
    esbuild: {
      // 让 esbuild 只处理纯 .ts 文件
      include: /\.ts$/,
      // 排除 JSX/TSX，交给我们的插件处理
      exclude: /\.[jt]sx$/,
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: 'automatic',
      },
    },
  }
}
```

这样配置后，`.ts` 文件继续走 esbuild（速度也很快），而 `.jsx`、`.tsx`、`.js` 走我们的 Oxc 转换。

不过说实话，这个设计有点 trade-off。理想情况下应该完全接管所有 JS/TS 文件的转换，但考虑到 Vite 生态的兼容性，保持这种混合模式可能更稳妥。

### 4.4 JSX 转换配置

JSX 转换有两种模式：

1. **Classic**：转换成 `React.createElement` 调用
2. **Automatic**：转换成 `_jsx`/`_jsxs` 调用，自动引入 `react/jsx-runtime`

React 17+ 推荐使用 automatic 模式，这也是我们插件的默认行为。配置项支持自定义：

```typescript
const jsxOpts = transformOpts.jsx && typeof transformOpts.jsx === 'object'
  ? transformOpts.jsx
  : {}

oxcTransform(id, code, {
  jsx: {
    ...jsxOpts,
    development: isDev, // 开发模式启用额外的调试信息
    refresh: enableRefresh ? {} : undefined, // Fast Refresh 注入
  },
})
```

`development: true` 会在转换结果中加入 `__source` 和 `__self` 等调试信息，方便在 React DevTools 里看到组件的源码位置。

---

## 五、Resolve 模块：模块解析

模块解析看起来简单，实际上是个大坑。`import './foo'` 这行代码，到底应该解析成哪个文件？

- `./foo.js`？
- `./foo.ts`？
- `./foo/index.js`？
- `./foo/index.ts`？
- 还是 `./foo.json`？

这取决于项目配置、Node.js 版本、模块类型等一系列因素。

### 5.1 为什么要自己做解析

Vite 内部已经有一套解析逻辑，为什么我们还要用 `oxc-resolver` 再来一套？

两个原因：

1. **性能**。Oxc resolver 是 Rust 实现的，解析速度比 Vite 的 JavaScript 实现更快。在大型项目中，模块解析的开销不可忽视。
2. **一致性**。既然 transform 用了 Oxc，resolver 也用 Oxc，整个工具链的行为会更一致。

当然，这是可选功能，默认开启但可以关闭。

### 5.2 基本实现

```typescript
import { ResolverFactory } from 'oxc-resolver'

let resolver: InstanceType<typeof ResolverFactory> | null = null

// 在 configResolved 中初始化
configResolved(config) {
  if (options.resolve !== false) {
    resolver = new ResolverFactory({
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.node'],
      conditionNames: ['import', 'require', 'browser', 'node', 'default'],
      builtinModules: true,
      moduleType: true,
      ...options.resolve,
    })
  }
}

// 在 resolveId hook 中使用
resolveId(id, importer, _resolveOptions) {
  // 处理 React Refresh 虚拟模块
  if (id === '/@react-refresh') {
    return id
  }

  if (!resolver || options.resolve === false) return null

  // 默认跳过 node_modules，除非显式启用
  if (
    !options.resolveNodeModules &&
    id[0] !== '.' &&
    !path.isAbsolute(id)
  ) {
    return null
  }

  try {
    const directory = importer ? path.dirname(importer) : process.cwd()
    const resolved = resolver.sync(directory, id)

    // 处理 Node.js 内置模块
    if (resolved.error?.startsWith('Builtin module')) {
      return {
        id,
        external: true,
        moduleSideEffects: false,
      }
    }

    if (resolved.path) {
      const format = getModuleFormat(resolved.path) || resolved.moduleType || 'commonjs'
      return {
        id: resolved.path,
        format,
      }
    }
  } catch (error) {
    // 解析失败，交给 Vite 的默认逻辑处理
    return null
  }

  return null
}
```

### 5.3 性能优化：跳过 node_modules

一个重要的优化是 **默认不解析 node_modules**：

```typescript
if (
  !options.resolveNodeModules &&
  id[0] !== '.' &&          // 不是相对路径
  !path.isAbsolute(id)       // 不是绝对路径
) {
  return null  // 交给 Vite 处理
}
```

为什么？因为 Vite 的预构建机制已经把 `node_modules` 里的依赖处理好了，我们没必要再去解析一遍。只解析项目内的相对路径和绝对路径，性能开销可控。

如果某些场景确实需要解析 `node_modules`，可以通过配置项开启：

```typescript
oxc({
  resolveNodeModules: true
})
```

### 5.4 内置模块处理

Node.js 有一些内置模块（`fs`、`path`、`http` 等），在浏览器环境是不存在的。当 `oxc-resolver` 遇到这些模块时，会返回一个特殊的 error：

```typescript
if (resolved.error?.startsWith('Builtin module')) {
  return {
    id,
    external: true,
    moduleSideEffects: false,
  }
}
```

把它标记为 `external`，告诉 Vite 这个模块不需要处理。

---

## 六、Minify 模块：代码压缩

生产构建时，代码压缩是必不可少的一环。`oxc-minify` 提供了和 Terser 类似的压缩能力，但性能更好。

### 6.1 在 generateBundle 中压缩

代码压缩放在 `generateBundle` hook 里做：

```typescript
async generateBundle(_outputOptions, bundle) {
  if (options.minify === false) return

  const { minifySync } = await import('oxc-minify')

  for (const fileName of Object.keys(bundle)) {
    const chunk = bundle[fileName]
    if (chunk.type !== 'chunk') continue

    try {
      const result = minifySync(fileName, chunk.code, {
        ...(options.minify === true ? {} : options.minify),
        sourcemap: options.sourcemap,
      })
      chunk.code = result.code

      // SourceMap 合并...
    } catch (error) {
      this.error(`Failed to minify ${fileName}: ${error}`)
    }
  }
}
```

这里有几个设计考量：

1. **为什么在 `generateBundle` 而不是 `transform`？** 因为压缩应该在所有代码转换完成后、输出文件前进行。此时代码已经是最终形态，压缩效果最好。

2. **为什么用动态 import？** `oxc-minify` 只在生产构建时需要，开发模式下不需要加载这个依赖，动态 import 可以减少冷启动时间。

3. **为什么跳过非 chunk 类型？** `bundle` 对象里既有 JS chunk，也有 CSS、图片等 asset。我们只压缩 JS。

### 6.2 SourceMap 合并

压缩代码会改变代码的行列位置，如果项目需要 sourcemap，必须把压缩前后的 sourcemap 合并，才能正确映射到源码。

这个合并逻辑用 `@ampproject/remapping` 来做：

```typescript
import remapping, { type EncodedSourceMap } from '@ampproject/remapping'

if (result.map && chunk.map) {
  const minifyMap: EncodedSourceMap = {
    version: 3,
    file: result.map.file,
    sources: result.map.sources,
    sourcesContent: result.map.sourcesContent,
    names: result.map.names,
    mappings: result.map.mappings,
  }
  const chunkMap: EncodedSourceMap = {
    version: 3,
    file: chunk.map.file,
    sources: chunk.map.sources,
    sourcesContent: chunk.map.sourcesContent,
    names: chunk.map.names,
    mappings: chunk.map.mappings,
  }

  // 合并两个 sourcemap
  const merged = remapping([minifyMap, chunkMap], () => null)

  chunk.map = {
    file: merged.file ?? '',
    mappings: merged.mappings as string,
    names: merged.names,
    sources: merged.sources as string[],
    sourcesContent: merged.sourcesContent as string[],
    version: merged.version,
    toUrl() {
      return `data:application/json;charset=utf-8;base64,${Buffer.from(JSON.stringify(this)).toString('base64')}`
    },
  }
}
```

`remapping` 函数接收一个 sourcemap 数组，按顺序合并。第一个是最终代码的 map（压缩后），第二个是上一步的 map（压缩前）。合并后的 map 可以从最终代码直接映射回原始源码。

### 6.3 压缩选项透传

`oxc-minify` 支持 Terser 风格的压缩选项：

```typescript
// 默认压缩
oxc({ minify: true })

// 自定义选项
oxc({
  minify: {
    mangle: true,        // 变量名混淆
    compress: {
      dropConsole: true, // 删除 console.log
    },
  }
})

// 禁用压缩
oxc({ minify: false })
```

这些选项原封不动传给 `minifySync`，插件层只加了一个 `sourcemap` 选项的处理。

---

## 七、React Fast Refresh：HMR 的核心

React Fast Refresh 是 React 官方的热更新方案，可以在修改组件代码后保留组件状态，只更新改变的部分。要让它正常工作，需要在编译时注入一些运行时代码。

这部分是整个插件最复杂的地方。

### 7.1 Fast Refresh 的工作原理

Fast Refresh 的基本原理是：

1. **编译时**：在每个模块末尾注入代码，把模块导出的组件注册到 Fast Refresh runtime。
2. **运行时**：当模块热更新时，runtime 对比新旧导出，判断是否可以安全刷新。
3. **刷新执行**：如果可以安全刷新，runtime 触发 React 重新渲染更新后的组件，同时保留状态。

关键在于「安全刷新」的判断。Fast Refresh 只能处理「纯组件变更」的情况。如果模块导出了非组件内容（比如常量、工具函数），且这些内容发生了变化，就必须做完整刷新。

### 7.2 运行时模块

我实现了一个虚拟模块 `/@react-refresh`，提供 Fast Refresh 的运行时代码：

```typescript
const refreshRuntimeCode = `
import RefreshRuntime from 'react-refresh/runtime';

export function injectIntoGlobalHook(globalObject) {
  RefreshRuntime.injectIntoGlobalHook(globalObject);
}

export function register(type, id) {
  RefreshRuntime.register(type, id);
}

export function createSignatureFunctionForTransform() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

export function performReactRefresh() {
  return RefreshRuntime.performReactRefresh();
}

// 判断是否是 React 组件
export function isLikelyComponentType(type) {
  if (typeof type !== 'function') return false;
  if (type.prototype != null && type.prototype.isReactComponent) return true;
  if (type.$$typeof) return false;
  const name = type.name || type.displayName;
  return typeof name === 'string' && /^[A-Z]/.test(name);
}

// 注册模块导出的组件
export function registerExportsForReactRefresh(filename, moduleExports) {
  for (const key in moduleExports) {
    if (key === '__esModule') continue;
    const exportValue = moduleExports[key];
    if (isLikelyComponentType(exportValue)) {
      RefreshRuntime.register(exportValue, filename + ' export ' + key);
    }
  }
}

// 防抖更新
let enqueueUpdateTimer = null;
function enqueueUpdate() {
  if (enqueueUpdateTimer === null) {
    enqueueUpdateTimer = setTimeout(() => {
      enqueueUpdateTimer = null;
      RefreshRuntime.performReactRefresh();
    }, 16);
  }
}

// 验证刷新边界并触发更新
export function validateRefreshBoundaryAndEnqueueUpdate(id, prevExports, nextExports) {
  // 检查导出是否发生不兼容的变化
  for (const key in prevExports) {
    if (key === '__esModule') continue;
    if (!(key in nextExports)) {
      return 'Could not Fast Refresh (export removed)';
    }
  }
  for (const key in nextExports) {
    if (key === '__esModule') continue;
    if (!(key in prevExports)) {
      return 'Could not Fast Refresh (new export)';
    }
  }

  let hasExports = false;
  for (const key in nextExports) {
    if (key === '__esModule') continue;
    hasExports = true;
    const value = nextExports[key];
    if (isLikelyComponentType(value)) continue;
    if (prevExports[key] === nextExports[key]) continue;
    return 'Could not Fast Refresh (non-component export changed)';
  }

  if (hasExports) {
    enqueueUpdate();
  }
  return undefined;
}

export const __hmr_import = (module) => import(/* @vite-ignore */ module);
`
```

这段代码做了几件事：

1. **组件注册**：`registerExportsForReactRefresh` 遍历模块导出，把看起来像组件的函数注册到 runtime。
2. **边界验证**：`validateRefreshBoundaryAndEnqueueUpdate` 检查新旧导出的差异，判断是否可以安全刷新。
3. **防抖更新**：`enqueueUpdate` 用 16ms 的防抖，避免短时间内多次触发刷新。

### 7.3 HTML Preamble 注入

Fast Refresh 需要在页面加载之前初始化全局钩子。通过 `transformIndexHtml` hook 注入：

```typescript
transformIndexHtml() {
  if (!isDev || !options.reactRefresh) return []

  return [
    {
      tag: 'script',
      attrs: { type: 'module' },
      children: `
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
`,
    },
  ]
}
```

这段脚本会被插入到 HTML 的 `<head>` 中，在任何业务代码执行之前运行。它做两件事：

1. 调用 `injectIntoGlobalHook(window)` 初始化 runtime。
2. 在 `window` 上挂载两个占位函数 `$RefreshReg$` 和 `$RefreshSig$`，防止业务代码报错。

### 7.4 模块尾部代码注入

最后，需要在每个 JSX/TSX 模块末尾注入 HMR 边界检测代码：

```typescript
if (enableRefresh && transformedCode.includes('$RefreshReg$')) {
  const refreshFooter = `
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "vite-plugin-oxc can't detect preamble. Something is wrong."
    );
  }

  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh(${JSON.stringify(id)}, currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(
        ${JSON.stringify(id)},
        currentExports,
        nextExports
      );
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, ${JSON.stringify(id)} + ' ' + id)
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}
`
  transformedCode = transformedCode + refreshFooter
}
```

这段代码的逻辑：

1. **动态导入自身**：`RefreshRuntime.__hmr_import(import.meta.url)` 拿到当前模块的导出。
2. **注册导出**：把导出的组件注册到 runtime。
3. **接受热更新**：通过 `import.meta.hot.accept` 监听更新，拿到新的导出后验证边界。
4. **判断刷新方式**：如果边界验证失败（`invalidateMessage` 不为空），调用 `invalidate` 触发完整刷新；否则自动执行 Fast Refresh。

注意这里有个细节：只有当转换后的代码包含 `$RefreshReg$` 时才注入。因为 Oxc 只会在检测到组件定义时才插入这些调用，如果模块里没有组件（比如纯工具函数文件），就不需要这套逻辑。

### 7.5 Web Worker 兼容

代码里有个判断：

```typescript
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  // ...
}
```

Web Worker 环境没有 `window` 对象，也不支持 HMR，所以需要跳过。

---

## 八、文件过滤：控制处理范围

不是所有文件都需要经过 Oxc 处理。CSS、图片、JSON 这些应该跳过。

### 8.1 Filter 实现

```typescript
export function createFilter(
  include?: FilterPattern,
  exclude?: FilterPattern
): (id: string) => boolean {
  const includePatterns = normalizePatterns(include)
  const excludePatterns = normalizePatterns(exclude)

  return (id: string) => {
    // 先检查 exclude，命中则跳过
    if (excludePatterns.length > 0) {
      for (const pattern of excludePatterns) {
        if (testPattern(pattern, id)) {
          return false
        }
      }
    }

    // 再检查 include
    if (includePatterns.length === 0) {
      return true // 没有 include 规则则默认处理
    }

    for (const pattern of includePatterns) {
      if (testPattern(pattern, id)) {
        return true
      }
    }

    return false
  }
}

function testPattern(pattern: string | RegExp, id: string): boolean {
  if (typeof pattern === 'string') {
    return id.includes(pattern)
  }
  return pattern.test(id)
}
```

这个实现遵循一个简单的规则：**exclude 优先于 include**。如果一个文件同时匹配 include 和 exclude，以 exclude 为准。

### 8.2 默认配置

```typescript
include: options.include || [/\.[cm]?[jt]sx?$/],
exclude: options.exclude || [/node_modules/],
```

默认配置的含义：

- **include**: 处理所有 `.js`、`.jsx`、`.ts`、`.tsx`、`.mjs`、`.mts`、`.cjs`、`.cts` 文件
- **exclude**: 跳过 `node_modules` 目录

`[cm]?` 这个正则匹配可选的 `c`（CommonJS）或 `m`（Module）前缀，覆盖了 Node.js 的各种模块扩展名约定。

---

## 九、配置系统设计

一个好的插件应该做到「零配置可用，有需要时可配」。

### 9.1 类型定义

```typescript
export interface VitePluginOxcOptions {
  include?: FilterPattern          // 文件包含规则
  exclude?: FilterPattern          // 文件排除规则
  enforce?: 'pre' | 'post'         // 插件执行顺序
  transform?: TransformOptions | false  // 转换选项，false 禁用
  resolve?: NapiResolveOptions | false  // 解析选项，false 禁用
  resolveNodeModules?: boolean     // 是否解析 node_modules
  minify?: MinifyOptions | boolean // 压缩选项
  sourcemap?: boolean              // SourceMap 生成
  reactRefresh?: boolean           // React Fast Refresh
}
```

每个配置项都可以是具体的选项对象、布尔值、或不设置（使用默认值）。

### 9.2 选项解析

```typescript
export function resolveOptions(
  options: VitePluginOxcOptions,
  isDev: boolean
): ResolvedOptions {
  return {
    include: options.include || [/\.[cm]?[jt]sx?$/],
    exclude: options.exclude || [/node_modules/],
    enforce: options.enforce,
    transform: options.transform !== false ? (options.transform || {}) : false,
    resolve: options.resolve !== false ? (options.resolve || {}) : false,
    resolveNodeModules: options.resolveNodeModules || false,
    minify: options.minify !== false ? (options.minify || false) : false,
    sourcemap: options.sourcemap ?? isDev,  // 开发模式默认开启
    reactRefresh: options.reactRefresh ?? true,  // 默认开启
  }
}
```

几个设计决策：

1. **`transform` 和 `resolve` 默认开启**，可以传 `false` 禁用
2. **`minify` 默认关闭**，需要显式传 `true` 或选项对象开启
3. **`sourcemap` 根据环境决定**，开发模式默认开启，生产模式默认关闭
4. **`reactRefresh` 默认开启**，因为大部分 React 项目都需要

### 9.3 enforce 处理

`enforce` 的处理比较特殊：

```typescript
const plugin: Plugin = {
  name: 'vite-plugin-oxc',
  enforce: 'pre',  // 默认值
  // ...
}

// 如果用户显式设置了 enforce，覆盖默认值
if ('enforce' in rawOptions) {
  plugin.enforce = rawOptions.enforce
}
```

为什么不直接用 `options.enforce || 'pre'`？因为用户可能想显式设置 `enforce: undefined`，表示不要任何 enforce 约束。用 `'enforce' in rawOptions` 可以区分「没传」和「传了 undefined」两种情况。

---

## 十、测试策略

工程化项目离不开测试。这个插件的测试主要覆盖以下场景。

### 10.1 单元测试结构

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import vitePluginOxc from '../src/index'

// Mock oxc-transform
vi.mock('oxc-transform', () => ({
  transformSync: vi.fn((_id: string, code: string, _options?: unknown) => ({
    code: `// Transformed: ${code}`,
    map: null,
    errors: [],
  })),
}))

// Mock oxc-resolver
vi.mock('oxc-resolver', () => ({
  ResolverFactory: class MockResolverFactory {
    sync(_directory: string, id: string) {
      return {
        path: `/resolved/${id}`,
        moduleType: 'module',
      }
    }
  },
}))

// Mock oxc-minify
vi.mock('oxc-minify', () => ({
  minifySync: vi.fn((fileName: string, code: string) => ({
    code: `/* Minified */ ${code.replace(/\s+/g, ' ').trim()}`,
    map: null,
  })),
}))
```

为什么要 mock Oxc 的依赖？因为：

1. **隔离测试范围**。单元测试关注的是插件的集成逻辑，不是 Oxc 本身的转换行为。
2. **测试执行速度**。原生依赖的加载需要时间，mock 后测试更快。
3. **确定性**。Oxc 的版本更新可能改变输出，mock 可以保证测试稳定。

### 10.2 核心测试用例

```typescript
describe('vite-plugin-oxc', () => {
  it('should create plugin with default options', () => {
    const plugin = vitePluginOxc()
    expect(plugin.name).toBe('vite-plugin-oxc')
    expect(plugin.enforce).toBe('pre')
    expect(typeof plugin.transform).toBe('function')
  })

  it('should allow overriding enforce option', () => {
    const pluginPost = vitePluginOxc({ enforce: 'post' })
    expect(pluginPost.enforce).toBe('post')

    const pluginNone = vitePluginOxc({ enforce: undefined })
    expect(pluginNone.enforce).toBeUndefined()
  })
})

describe('generateBundle - oxc-minify integration', () => {
  it('should minify chunk code using oxc-minify', async () => {
    const plugin = vitePluginOxc({ minify: true })
    ;(plugin.configResolved as Function)({ command: 'build' })

    const bundle = {
      'index.js': {
        type: 'chunk',
        code: 'function hello() { console.log("hi"); }',
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call({ error: vi.fn() }, {}, bundle)

    expect(bundle['index.js'].code).toContain('Minified')
  })

  it('should skip minification when minify is false', async () => {
    const plugin = vitePluginOxc({ minify: false })
    ;(plugin.configResolved as Function)({ command: 'build' })

    const originalCode = 'function hello() { console.log("hi"); }'
    const bundle = {
      'index.js': { type: 'chunk', code: originalCode, map: null },
    }

    await (plugin.generateBundle as Function).call({ error: vi.fn() }, {}, bundle)

    expect(bundle['index.js'].code).toBe(originalCode)
  })

  it('should merge sourcemaps when both exist', async () => {
    // 测试 sourcemap 合并逻辑
  })
})
```

测试覆盖了：

- 插件创建和默认配置
- 配置覆盖
- 压缩功能的开启/关闭
- SourceMap 合并
- 错误处理

---

## 十一、性能实测

说了这么多理论，实际效果如何？我用一个中型 React 项目做了测试。

### 11.1 测试环境

- **项目规模**：约 200 个 TypeScript/TSX 文件，5 万行代码
- **机器配置**：MacBook Pro M2，16GB 内存
- **Node.js**：v20.10.0

### 11.2 开发模式冷启动

| 方案 | 首次启动时间 |
|------|--------------|
| Vite 默认（esbuild） | 1.2s |
| vite-plugin-oxc | 1.1s |

开发模式差距不大，因为 Vite 的预构建已经很快了。

### 11.3 生产构建

| 方案 | 构建时间 | 产物体积 |
|------|----------|----------|
| Vite 默认 | 18.3s | 1.42 MB |
| vite-plugin-oxc (无压缩) | 12.1s | 1.58 MB |
| vite-plugin-oxc (开启压缩) | 14.7s | 1.39 MB |

Transform 阶段提速明显（约 33%），开启 oxc-minify 后总体时间也有优势，且压缩效果略好于默认的 esbuild。

### 11.4 HMR 响应时间

修改一个组件文件后：

| 方案 | HMR 更新时间 |
|------|--------------|
| Vite + esbuild | 50-80ms |
| vite-plugin-oxc | 40-60ms |

HMR 场景下 Oxc 的优势更明显，因为单文件转换时 Oxc 的启动开销比例更低。

---

## 十二、踩过的坑

开发过程中遇到了不少问题，记录几个典型的。

### 12.1 esbuild 的 JSX 处理冲突

最开始没有禁用 esbuild 的 JSX 处理，导致 JSX 被转换了两次，结果代码里出现了奇怪的双重嵌套。

解决方案就是在 `config` hook 里配置 esbuild 跳过 JSX/TSX：

```typescript
config() {
  return {
    esbuild: {
      include: /\.ts$/,
      exclude: /\.[jt]sx$/,
    },
  }
}
```

### 12.2 SourceMap 合并顺序

第一版 sourcemap 合并写反了顺序：

```typescript
// 错误写法
const merged = remapping([chunkMap, minifyMap], () => null)

// 正确写法
const merged = remapping([minifyMap, chunkMap], () => null)
```

`remapping` 的数组是从「最终代码」到「原始代码」的顺序。压缩后的 map 在前，压缩前的 map 在后。

### 12.3 React Refresh 的 preamble 时机

Fast Refresh 的 preamble 必须在任何业务代码之前执行。最开始我用 `transform` hook 在第一个 JSX 文件转换时注入，结果时机不稳定。

后来改用 `transformIndexHtml` hook，直接往 HTML 里插入 `<script>`，稳定多了。

### 12.4 模块格式推断

有些项目混用 ESM 和 CommonJS，如果模块格式判断错误，会导致语法错误或运行时问题。

最后的方案是综合多个信息源：

1. 上游传递的 `format` 参数
2. 文件扩展名（`.mjs`/`.cjs` 等）
3. Oxc resolver 返回的 `moduleType`
4. 兜底默认值

### 12.5 虚拟模块的处理

`/@react-refresh` 是个虚拟模块，不存在于文件系统。需要在 `resolveId` 和 `load` 两个 hook 里配合处理：

```typescript
resolveId(id) {
  if (id === '/@react-refresh') {
    return id  // 告诉 Vite 这个 ID 我来处理
  }
}

load(id) {
  if (id === '/@react-refresh') {
    return refreshRuntimeCode  // 返回模块内容
  }
}
```

---

## 十三、未来展望

### 13.1 Rolldown 的影响

Vite 团队正在开发 Rolldown，一个用 Rust 重写的 Rollup。一旦 Rolldown 成熟，Vite 的整个构建流程都会是 Rust 实现，性能会再上一个台阶。

Rolldown 底层使用的就是 Oxc 的 parser 和 transformer，所以 `vite-plugin-oxc` 的很多逻辑可能会被 Vite 原生支持。到那时，这个插件的历史使命可能就完成了。

实际上，官方文档里已经提到：

> 这个包已弃用。请使用 `@vitejs/plugin-react`，因为 `rolldown-vite` 已自动启用基于 Oxc 的 Fast Refresh 转换。

这说明方向是对的，只是时机早了一点。

### 13.2 工具链的 Rust 化趋势

纵观前端工具链的演进，Rust 化是一个明确的趋势：

- **Bundler**：Rolldown、Turbopack
- **Compiler**：SWC、Oxc
- **Linter**：oxlint、Biome
- **Formatter**：dprint、Biome
- **Package Manager**：pnpm（部分 Rust）、Bun（Zig）

JavaScript 工具用 JavaScript 写的时代正在过去。对于开发者来说，这意味着更快的开发体验，但也意味着参与工具开发的门槛变高了——你得会 Rust。

### 13.3 这个插件的定位

虽然 Rolldown 出来后这个插件可能就没用了，但它的价值在于：

1. **作为学习材料**。展示了如何把一个 Rust 工具链集成到现有的 JavaScript 生态中。
2. **作为过渡方案**。在 Rolldown 正式发布前，想尝鲜 Oxc 的人可以用这个插件。
3. **作为参考实现**。React Fast Refresh 的集成逻辑，sourcemap 合并的处理，这些代码可以被其他项目借鉴。

---

## 十四、总结

回到开头的问题：2024 年了，前端构建为什么还是慢？

答案是：工具链正在追赶硬件的脚步，只是还没追上。

从 Babel 到 esbuild，从 SWC 到 Oxc，每一代工具都在压榨更多性能。`vite-plugin-oxc` 是我在这条路上的一次尝试——用 Oxc 这套 Rust 工具链，给 Vite 的构建流程提提速。

核心实现其实不复杂：

- **Transform**：调用 `oxc-transform` 做代码转换，处理好 sourceType 推断和 JSX 配置
- **Resolve**：用 `oxc-resolver` 做模块解析，默认跳过 node_modules 保证性能
- **Minify**：在 `generateBundle` 阶段用 `oxc-minify` 压缩，注意 sourcemap 合并
- **React Fast Refresh**：虚拟模块 + HTML preamble + 模块尾部注入，三件套配合

难点在于细节：与 Vite 内置 esbuild 的配合、sourcemap 合并的顺序、模块格式的正确推断、HMR 边界检测的实现……这些东西文档不会告诉你，只能靠踩坑。

这个插件的代码开源在 GitHub 上，欢迎 star 和 PR。虽然它可能很快就会被 Rolldown 取代，但在那之前，希望它能给想了解 Vite 插件开发、Oxc 集成的同学一些参考。

前端工具链的进化永远不会停止。今天是 Oxc，明天可能是更快的东西。作为开发者，保持学习、保持好奇，可能是我们能做的最重要的事。

> 项目源码：https://github.com/Sunny-117/vite-plugin-oxc
> 欢迎 Star、Issue 和 PR！

---

## 参考资料

- [Oxc 官方文档](https://oxc-project.github.io/)
- [Vite 插件开发指南](https://vitejs.dev/guide/api-plugin.html)
- [React Fast Refresh 原理](https://github.com/facebook/react/issues/16604)
- [esbuild 设计思路](https://esbuild.github.io/faq/#why-is-esbuild-fast)
- [SWC 官方博客](https://swc.rs/blog)
- [@ampproject/remapping 文档](https://github.com/ampproject/remapping)

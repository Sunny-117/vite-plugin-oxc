import path from 'node:path'
import process from 'node:process'
import remapping, { type EncodedSourceMap } from '@ampproject/remapping'
import { ResolverFactory } from 'oxc-resolver'
import { transformSync as oxcTransform } from 'oxc-transform'
import type { Plugin } from 'vite'
import type { VitePluginOxcOptions } from './types'
import { createFilter, guessSourceType, getModuleFormat, resolveOptions } from './utils'

// React Refresh runtime code (based on @vitejs/plugin-react implementation)
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

export function isLikelyComponentType(type) {
  if (typeof type !== 'function') return false;
  if (type.prototype != null && type.prototype.isReactComponent) return true;
  if (type.$$typeof) return false;
  const name = type.name || type.displayName;
  return typeof name === 'string' && /^[A-Z]/.test(name);
}

export function registerExportsForReactRefresh(filename, moduleExports) {
  for (const key in moduleExports) {
    if (key === '__esModule') continue;
    const exportValue = moduleExports[key];
    if (isLikelyComponentType(exportValue)) {
      RefreshRuntime.register(exportValue, filename + ' export ' + key);
    }
  }
}

let pendingUpdates = [];
let enqueueUpdateTimer = null;

function enqueueUpdate() {
  if (enqueueUpdateTimer === null) {
    enqueueUpdateTimer = setTimeout(() => {
      enqueueUpdateTimer = null;
      RefreshRuntime.performReactRefresh();
    }, 16);
  }
}

export function validateRefreshBoundaryAndEnqueueUpdate(id, prevExports, nextExports) {
  // Check if exports changed in incompatible way
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

export default { injectIntoGlobalHook };
`

/**
 * Vite plugin for Oxc integration
 * 
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import oxc from 'vite-plugin-oxc'
 * 
 * export default defineConfig({
 *   plugins: [oxc()],
 * })
 * ```
 */
export default function vitePluginOxc(rawOptions: VitePluginOxcOptions = {}): Plugin {
  let options: ReturnType<typeof resolveOptions>
  let filter: ReturnType<typeof createFilter>
  let resolver: InstanceType<typeof ResolverFactory> | null = null
  let isDev = false

  // React Refresh preamble code (same as @vitejs/plugin-react)
  const reactRefreshPreamble = `
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
`

  const plugin: Plugin = {
    name: 'vite-plugin-oxc',
    enforce: 'pre',

    config(_userConfig, { command }) {
      const isDev = command === 'serve'
      // Disable esbuild's JSX/TSX transformation so oxc can handle it
      return {
        esbuild: {
          // Preserve JSX so that oxc transform can handle it
          include: /\.ts$/,
          exclude: /\.[jt]sx$/,
        },
        optimizeDeps: {
          esbuildOptions: {
            // Also for optimizeDeps pre-bundling
            jsx: 'automatic',
          },
        },
      }
    },

    configResolved(config) {
      isDev = config.command === 'serve'
      options = resolveOptions(rawOptions, isDev)
      filter = createFilter(options.include, options.exclude)

      // Initialize resolver if resolve is enabled
      if (options.resolve !== false) {
        resolver = new ResolverFactory({
          extensions: [
            '.mjs',
            '.js',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.node',
          ],
          conditionNames: ['import', 'require', 'browser', 'node', 'default'],
          builtinModules: true,
          moduleType: true,
          ...options.resolve,
        })
      }
    },

    transformIndexHtml() {
      if (!isDev || !options.reactRefresh) return []

      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: reactRefreshPreamble,
        },
      ]
    },

    resolveId(id, importer, _resolveOptions) {
      // Handle React Refresh virtual module
      if (id === '/@react-refresh') {
        return id
      }

      if (!resolver || options.resolve === false) return null
      
      // Skip node_modules resolution unless explicitly enabled
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
        // Let Vite handle resolution fallback
        return null
      }

      return null
    },

    load(id) {
      // Provide React Refresh runtime
      if (id === '/@react-refresh') {
        return refreshRuntimeCode
      }
    },

    transform(code, id, transformOptions) {
      if (!filter(id) || options.transform === false) return null

      // Check if this is a JSX/TSX file for React Refresh
      const isJsxFile = /\.[jt]sx$/.test(id)
      const enableRefresh = isDev && options.reactRefresh && isJsxFile

      try {
        const transformOpts = typeof options.transform === 'object' ? options.transform : {}
        const jsxOpts = transformOpts.jsx && typeof transformOpts.jsx === 'object' ? transformOpts.jsx : {}
        const result = oxcTransform(id, code, {
          ...transformOpts,
          sourceType: guessSourceType(id, (transformOptions as any)?.format),
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

        let transformedCode = result.code

        // Add React Refresh footer for JSX files in dev mode (same as @vitejs/plugin-react)
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
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(${JSON.stringify(id)}, currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, ${JSON.stringify(id)} + ' ' + id) }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }
`
          transformedCode = transformedCode + refreshFooter
        }

        return {
          code: transformedCode,
          map: result.map,
        }
      } catch (error) {
        this.error(`Failed to transform ${id}: ${error}`)
      }
    },

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
        } catch (error) {
          this.error(`Failed to minify ${fileName}: ${error}`)
        }
      }
    },
  }

  // Override enforce if user explicitly specified it (including setting to undefined)
  if ('enforce' in rawOptions) {
    plugin.enforce = rawOptions.enforce
  }

  return plugin
}

// Export types for TypeScript users
export type { VitePluginOxcOptions } from './types'

import path from 'node:path'
import process from 'node:process'
import { ResolverFactory } from 'oxc-resolver'
import { transform as oxcTransform } from 'oxc-transform'
import type { Plugin } from 'vite'
import type { VitePluginOxcOptions } from './types'
import { createFilter, guessSourceType, getModuleFormat, resolveOptions } from './utils'

interface RenderedChunk {
  fileName: string
  [key: string]: any
}

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

  const plugin: Plugin = {
    name: 'vite-plugin-oxc',

    configResolved(config) {
      const isDev = config.command === 'serve'
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

    resolveId(id, importer, _resolveOptions) {
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

    transform(code, id, transformOptions) {
      if (!filter(id) || options.transform === false) return null

      try {
        const result = oxcTransform(id, code, {
          ...options.transform,
          sourceType: guessSourceType(id, (transformOptions as any)?.format),
          sourcemap: options.sourcemap,
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
      } catch (error) {
        this.error(`Failed to transform ${id}: ${error}`)
      }
    },

    async renderChunk(code, chunk: RenderedChunk) {
      if (options.minify === false) return null

      try {
        const { minify } = await import('oxc-minify')
        const result = minify(chunk.fileName, code, {
          ...(options.minify === true ? {} : options.minify),
          sourcemap: options.sourcemap,
        })

        return {
          code: result.code,
          map: result.map,
        }
      } catch (error) {
        this.error(`Failed to minify ${chunk.fileName}: ${error}`)
      }
    },
  }

  // Set enforce after plugin creation to avoid TypeScript issues
  if (rawOptions.enforce) {
    plugin.enforce = rawOptions.enforce
  }

  return plugin
}

// Export types for TypeScript users
export type { VitePluginOxcOptions } from './types'

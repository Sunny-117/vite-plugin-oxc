import path from 'node:path'
import process from 'node:process'
import remapping, { type EncodedSourceMap } from '@ampproject/remapping'
import { ResolverFactory } from 'oxc-resolver'
import { transformSync as oxcTransform } from 'oxc-transform'
import type { Plugin } from 'vite'
import type { VitePluginOxcOptions } from './types'
import { createFilter, guessSourceType, getModuleFormat, resolveOptions } from './utils'

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

  // Set enforce after plugin creation to avoid TypeScript issues
  if (rawOptions.enforce) {
    plugin.enforce = rawOptions.enforce
  }

  return plugin
}

// Export types for TypeScript users
export type { VitePluginOxcOptions } from './types'

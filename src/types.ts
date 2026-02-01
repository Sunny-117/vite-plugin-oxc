import type { MinifyOptions } from 'oxc-minify'
import type { NapiResolveOptions } from 'oxc-resolver'
import type { TransformOptions } from 'oxc-transform'

export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null

export interface VitePluginOxcOptions {
  /**
   * Files to include for transformation
   * @default [/\.[cm]?[jt]sx?$/]
   */
  include?: FilterPattern
  
  /**
   * Files to exclude from transformation
   * @default [/node_modules/]
   */
  exclude?: FilterPattern
  
  /**
   * Plugin enforcement order
   */
  enforce?: 'pre' | 'post'
  
  /**
   * Transform options passed to oxc-transform
   * Set to false to disable transformation
   */
  transform?: Omit<TransformOptions, 'sourcemap'> | false
  
  /**
   * Resolve options passed to oxc-resolver
   * Set to false to disable custom resolution
   */
  resolve?: NapiResolveOptions | false
  
  /**
   * Whether to resolve node_modules
   * The plugin skips resolving node_modules by default for performance
   * @default false
   */
  resolveNodeModules?: boolean
  
  /**
   * Minify options passed to oxc-minify
   * Set to false to disable minification
   * Set to true to use default minification options
   */
  minify?: Omit<MinifyOptions, 'sourcemap'> | boolean
  
  /**
   * Enable source map generation
   * @default true in development, false in production
   */
  sourcemap?: boolean
}

export interface ResolvedOptions extends Required<Omit<VitePluginOxcOptions, 'enforce'>> {
  enforce?: 'pre' | 'post'
}

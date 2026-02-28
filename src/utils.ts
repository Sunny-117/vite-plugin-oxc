import path from 'node:path'
import type { FilterPattern, ResolvedOptions, VitePluginOxcOptions } from './types'

/**
 * Create a filter function from include/exclude patterns
 */
export function createFilter(
  include?: FilterPattern,
  exclude?: FilterPattern
): (id: string) => boolean {
  const includePatterns = normalizePatterns(include)
  const excludePatterns = normalizePatterns(exclude)

  return (id: string) => {
    // Check exclude patterns first
    if (excludePatterns.length > 0) {
      for (const pattern of excludePatterns) {
        if (testPattern(pattern, id)) {
          return false
        }
      }
    }

    // Check include patterns
    if (includePatterns.length === 0) {
      return true
    }

    for (const pattern of includePatterns) {
      if (testPattern(pattern, id)) {
        return true
      }
    }

    return false
  }
}

function normalizePatterns(patterns?: FilterPattern): (string | RegExp)[] {
  if (!patterns) return []
  if (Array.isArray(patterns)) return patterns.filter(Boolean) as (string | RegExp)[]
  return [patterns as string | RegExp]
}

function testPattern(pattern: string | RegExp, id: string): boolean {
  if (typeof pattern === 'string') {
    return id.includes(pattern)
  }
  return pattern.test(id)
}

/**
 * Guess the source type based on file extension and format
 */
export function guessSourceType(
  id: string,
  format?: string
): 'module' | 'script' | undefined {
  if (format === 'module' || format === 'module-typescript') {
    return 'module'
  } else if (format === 'commonjs' || format === 'commonjs-typescript') {
    return 'script'
  }
  
  const moduleFormat = getModuleFormat(id)
  if (moduleFormat) {
    return moduleFormat === 'module' ? 'module' : 'script'
  }
}

/**
 * Get module format based on file extension
 */
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
      return 'module'
  }
}

/**
 * Resolve plugin options with defaults
 */
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
    sourcemap: options.sourcemap ?? isDev,
    reactRefresh: options.reactRefresh ?? true,
  }
}

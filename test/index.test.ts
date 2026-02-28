import { describe, it, expect, vi, beforeEach } from 'vitest'
import vitePluginOxc from '../src/index'
import { transformSync } from 'oxc-transform'

// Mock oxc-transform
vi.mock('oxc-transform', () => ({
  transformSync: vi.fn((_id: string, code: string, _options?: unknown) => ({
    code: `// Transformed: ${code}`,
    map: null,
    errors: [] as Array<{ message: string }>,
  })),
}))

// Get mocked transformSync for test manipulation
const transformSyncMock = vi.mocked(transformSync)

// Mock ResolverFactory as a class
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

interface MockSourceMap {
  version: number
  file: string
  sources: string[]
  sourcesContent: string[]
  names: string[]
  mappings: string
}

interface MockMinifyResult {
  code: string
  map: MockSourceMap | null
}

const minifySyncMock = vi.fn(
  (fileName: string, code: string, _options?: unknown): MockMinifyResult => ({
    code: `/* Minified: ${fileName} */ ${code.replace(/\s+/g, ' ').trim()}`,
    map: null,
  })
)

vi.mock('oxc-minify', () => ({
  minifySync: minifySyncMock,
}))

describe('vite-plugin-oxc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create plugin with default options', () => {
    const plugin = vitePluginOxc()
    expect(plugin.name).toBe('vite-plugin-oxc')
    expect(typeof plugin.transform).toBe('function')
  })

  it('should create plugin with custom options', () => {
    const plugin = vitePluginOxc({
      include: [/\.tsx?$/],
      exclude: [/node_modules/],
      transform: {
        jsx: {
          runtime: 'automatic',
        },
      },
      minify: true,
    })

    expect(plugin.name).toBe('vite-plugin-oxc')
    expect(plugin.enforce).toBeUndefined()
  })

  it('should set enforce option correctly', () => {
    const plugin = vitePluginOxc({ enforce: 'pre' })
    expect(plugin.enforce).toBe('pre')
  })

  it('should handle transform disabled', () => {
    const plugin = vitePluginOxc({ transform: false })
    expect(plugin.name).toBe('vite-plugin-oxc')
  })

  it('should handle minify disabled', () => {
    const plugin = vitePluginOxc({ minify: false })
    expect(plugin.name).toBe('vite-plugin-oxc')
  })
})

describe('generateBundle - oxc-minify integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should minify chunk code using oxc-minify', async () => {
    const plugin = vitePluginOxc({ minify: true })

    // Simulate configResolved to initialize options
    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = `
      function hello() {
        const message = "Hello World";
        console.log(message);
      }
    `
    const bundle = {
      'assets/index-abc123.js': {
        type: 'chunk' as const,
        code,
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).toHaveBeenCalledTimes(1)
    expect(minifySyncMock).toHaveBeenCalledWith(
      'assets/index-abc123.js',
      code,
      expect.objectContaining({ sourcemap: false })
    )
    expect(bundle['assets/index-abc123.js'].code).toContain('Minified')
  })

  it('should skip minification when minify is false', async () => {
    const plugin = vitePluginOxc({ minify: false })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = 'function hello() { console.log("hi"); }'
    const bundle = {
      'assets/index.js': {
        type: 'chunk' as const,
        code,
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).not.toHaveBeenCalled()
    expect(bundle['assets/index.js'].code).toBe(code)
  })

  it('should skip non-chunk assets', async () => {
    const plugin = vitePluginOxc({ minify: true })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const bundle = {
      'assets/image.png': {
        type: 'asset' as const,
        source: Buffer.from('fake image'),
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).not.toHaveBeenCalled()
  })

  it('should pass custom minify options to oxc-minify', async () => {
    const customMinifyOptions = {
      mangle: true,
      compress: {
        dropConsole: true,
      },
    }
    const plugin = vitePluginOxc({ minify: customMinifyOptions })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = 'const x = 1;'
    const bundle = {
      'chunk.js': {
        type: 'chunk' as const,
        code,
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).toHaveBeenCalledWith(
      'chunk.js',
      code,
      expect.objectContaining({
        mangle: true,
        compress: { dropConsole: true },
        sourcemap: false,
      })
    )
  })

  it('should enable sourcemap in minify when sourcemap option is true', async () => {
    const plugin = vitePluginOxc({ minify: true, sourcemap: true })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = 'const x = 1;'
    const bundle = {
      'chunk.js': {
        type: 'chunk' as const,
        code,
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).toHaveBeenCalledWith(
      'chunk.js',
      code,
      expect.objectContaining({ sourcemap: true })
    )
  })

  it('should handle minify errors gracefully', async () => {
    const errorMock = vi.fn()
    minifySyncMock.mockImplementationOnce(() => {
      throw new Error('Minification failed')
    })

    const plugin = vitePluginOxc({ minify: true })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = 'invalid code {'
    const bundle = {
      'broken.js': {
        type: 'chunk' as const,
        code,
        map: null,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: errorMock },
      {},
      bundle
    )

    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('Failed to minify broken.js')
    )
  })

  it('should minify multiple chunks', async () => {
    const plugin = vitePluginOxc({ minify: true })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const bundle = {
      'chunk1.js': {
        type: 'chunk' as const,
        code: 'const a = 1;',
        map: null,
      },
      'chunk2.js': {
        type: 'chunk' as const,
        code: 'const b = 2;',
        map: null,
      },
      'style.css': {
        type: 'asset' as const,
        source: '.foo { color: red; }',
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    expect(minifySyncMock).toHaveBeenCalledTimes(2)
    expect(bundle['chunk1.js'].code).toContain('Minified')
    expect(bundle['chunk2.js'].code).toContain('Minified')
  })

  it('should merge sourcemaps when both minify and chunk have maps', async () => {
    // Mock minifySync to return a sourcemap
    minifySyncMock.mockImplementationOnce((fileName: string, code: string) => ({
      code: `/* Minified: ${fileName} */ ${code.replace(/\s+/g, ' ').trim()}`,
      map: {
        version: 3,
        file: fileName,
        sources: [fileName],
        sourcesContent: [code],
        names: [],
        mappings: 'AAAA',
      },
    }))

    const plugin = vitePluginOxc({ minify: true, sourcemap: true })

    const mockConfig = {
      command: 'build' as const,
    }
    ;(plugin.configResolved as Function)(mockConfig)

    const code = 'const x = 1;'
    const originalMap = {
      version: 3,
      file: 'chunk.js',
      sources: ['original.ts'],
      sourcesContent: ['const x: number = 1;'],
      names: [],
      mappings: 'AAAA',
    }
    const bundle = {
      'chunk.js': {
        type: 'chunk' as const,
        code,
        map: originalMap,
      },
    }

    await (plugin.generateBundle as Function).call(
      { error: vi.fn() },
      {},
      bundle
    )

    // Verify sourcemap was merged (map should be updated)
    expect(bundle['chunk.js'].map).toBeDefined()
    expect(bundle['chunk.js'].map.version).toBe(3)
    // The merged map should trace back to original source
    expect(bundle['chunk.js'].map.sources).toContain('original.ts')
  })
})

import { describe, it, expect, vi } from 'vitest'
import vitePluginOxc from '../src/index'

// Mock oxc modules
vi.mock('oxc-transform', () => ({
  transform: vi.fn((id, code, options) => ({
    code: `// Transformed: ${code}`,
    map: null,
    errors: [],
  })),
}))

vi.mock('oxc-resolver', () => ({
  ResolverFactory: vi.fn().mockImplementation(() => ({
    sync: vi.fn((directory, id) => ({
      path: `/resolved/${id}`,
      moduleType: 'module',
    })),
  })),
}))

vi.mock('oxc-minify', () => ({
  minify: vi.fn((fileName, code, options) => ({
    code: `/* Minified */ ${code}`,
    map: null,
  })),
}))

describe('vite-plugin-oxc', () => {
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

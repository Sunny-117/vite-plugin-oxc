// Simple test to check if our plugin loads correctly
import vitePluginOxc from './dist/index.js'

console.log('Testing vite-plugin-oxc...')

try {
  const plugin = vitePluginOxc({
    transform: {
      jsx: {
        runtime: 'automatic'
      }
    }
  })
  
  console.log('✅ Plugin created successfully')
  console.log('Plugin name:', plugin.name)
  console.log('Plugin has transform:', typeof plugin.transform === 'function')
  console.log('Plugin has resolveId:', typeof plugin.resolveId === 'function')
  console.log('Plugin has renderChunk:', typeof plugin.renderChunk === 'function')
  
} catch (error) {
  console.error('❌ Plugin creation failed:', error.message)
  process.exit(1)
}

console.log('✅ All tests passed!')

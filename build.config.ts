import { defineConfig } from 'robuild'

export default defineConfig({
  entries: [
    {
      input: 'src/index',
      type: 'bundle',
    }
  ],
})

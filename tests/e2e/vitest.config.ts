import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { config } from 'dotenv'

// Load .env.test before tests run
config({ path: resolve(__dirname, '.env.test') })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: resolve(__dirname),
    include: ['scenarios/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 120000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    sequence: {
      shuffle: false
    },
    env: {
      // Pass through environment variables to tests
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5679',
      N8N_API_URL: process.env.N8N_API_URL || 'http://localhost:5679/api/v1',
      N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || 'http://localhost:5679/webhook',
      N8N_API_KEY: process.env.N8N_API_KEY || ''
    }
  }
})

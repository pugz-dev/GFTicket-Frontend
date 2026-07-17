import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { coverageConfigDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', ...coverageConfigDefaults.exclude],
      thresholds: {
        'src/services/**/*.js': { branches: 70, functions: 70, lines: 70, statements: 70 },
        'src/components/**/*.jsx': { branches: 50, functions: 50, lines: 50, statements: 50 },
      },
    },
  },
})

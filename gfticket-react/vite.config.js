import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      thresholds: {
        'src/services/**/*.js': { branches: 70, functions: 70, lines: 70, statements: 70 },
        'src/components/**/*.jsx': { branches: 50, functions: 50, lines: 50, statements: 50 },
      },
    },
  },
})

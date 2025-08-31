import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'src/**/*.js',
        'index.js'
      ],
      exclude: [
        'src/design-system/**',
        'dist/**',
        'examples/**'
      ]
    }
  }
});

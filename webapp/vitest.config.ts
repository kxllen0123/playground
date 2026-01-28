import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*', 'tests/fixtures/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types.ts',
        '.next/',
        'coverage/',
        'playwright-report/',
        'test-results/',
        'public/',
        // UI components (covered by E2E tests)
        'components/ui/**',
        'app/components/**',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/globals.css',
        'app/favicon.ico',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

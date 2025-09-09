import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                        // describe/it without imports
    environment: 'node',                  // Node.js environment
    include: ['backend/test/**/*.test.ts'], // only backend tests
    setupFiles: './backend/test/setup.ts'   // optional: for global mocks
  },
});
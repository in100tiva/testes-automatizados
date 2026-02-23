import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10000, // Neon pode demorar um pouco no cold start
    setupFiles: ['dotenv/config'],
  },
});

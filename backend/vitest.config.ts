import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      all: true,
      include: ['src/app.ts'],
      reporter: ['text', 'html'],
    },
  },
});

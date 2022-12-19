/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Markdown from './src'

// used for testing, library code uses TSUP to build exports
export default defineConfig({
  test: {
    dir: 'test',
    exclude: ['**/*.spec.ts'],
    environment: 'happy-dom',
    api: {
      host: '0.0.0.0',
    },
  },
  plugins: [

    Markdown(),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }) as any,
  ],
})

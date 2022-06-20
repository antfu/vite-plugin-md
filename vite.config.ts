/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import Markdown, { code, link, meta } from './src'

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
    Pages({
      extensions: ['vue', 'md'],
    }),
    Layouts(),
    Markdown({
      builders: [link(), code({ theme: 'base' }), meta()],
      excerpt: true,
      exposeExcerpt: true,
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ],
})

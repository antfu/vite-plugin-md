/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import Markdown, { link, meta } from './src/index'

// used for testing, library code uses TSUP to build exports
export default defineConfig(() => ({
  test: {
    dir: 'test',
  },
  plugins: [
    Pages({
      extensions: ['vue', 'md'],
    }),
    Layouts(),
    Markdown({ builders: [link(), meta()] }),
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
    }),
  ],
}))

/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
// import CT from 'cypress-types'
import Markdown, { code, link, meta } from './src'

// used for testing, library code uses TSUP to build exports
export default defineConfig({
  test: {
    dir: 'test',
    exclude: ['**/*.spec.ts'],
  },
  plugins: [
    Pages({
      extensions: ['vue', 'md'],
    }),
    Layouts(),
    Markdown({ builders: [link(), meta(), code({ theme: 'base' })] }),
    Vue({
      include: [/\.vue$/, /\.md$/],
      // reactivityTransform: true,
    }),
    // CT(Cypress),
  ],
})

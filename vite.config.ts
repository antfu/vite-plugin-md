/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
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
    Markdown({ linkTransforms: link(), frontmatterPreprocess: meta() }),
  ],
}))

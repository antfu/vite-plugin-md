/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Markdown from '../src/index'

// used for testing, library code uses TSUP to build exports
export default defineConfig(() => ({
  test: {
    dir: 'test',
  },
  plugins: [
    Markdown({ exposeFrontmatter: true }),
  ],
}))

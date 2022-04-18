
let __unconfig_data;
let __unconfig_stub = function (data) { __unconfig_data = data };
__unconfig_stub.default = (data) => { __unconfig_data = data };
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Markdown, { link, meta } from './src/index'

// used for testing, library code uses TSUP to build exports
const __unconfig_default =  defineConfig(() => ({
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

if (typeof __unconfig_default === "function") __unconfig_default();export default __unconfig_data;
import { defineConfig } from "vite";
import Markdown, { meta, link } from '../src/index'

export default defineConfig(() => ({
  plugins: [
    Markdown({ linkTransforms: link(), frontmatterPreprocess: meta() }),
  ],
}))

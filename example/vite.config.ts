import { UserConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'
import prism from 'markdown-it-prism'

const config: UserConfig = {
  plugins: [
    Vue(),
    Markdown({
      markdownItUses: [
        prism,
      ],
    }),
  ],
}

export default config

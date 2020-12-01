import { UserConfig } from 'vite'
import Markdown from 'vite-plugin-md'
import prism from 'markdown-it-prism'

const config: UserConfig = {
  plugins: [
    Markdown({
      markdownItUses: [
        prism,
      ],
    }),
  ],
}

export default config

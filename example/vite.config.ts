import { UserConfig } from 'vite'
import MD from 'vite-plugin-md'

const config: UserConfig = {
  plugins: [
    MD(),
  ],
}

export default config

import path from 'path'
import { startDevServer } from '@cypress/vite-dev-server'

export default function (on, config) {
  console.log(config)

  on('dev-server:start', (options) => {
    return startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(process.cwd(), 'vite.config.ts'),
        logLevel: 'error',
      },
    })
  })

  return config
}

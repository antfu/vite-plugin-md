import path from 'path'
import { startDevServer } from '@cypress/vite-dev-server'

export default function (on: any, config: any) {
  on('dev-server:start', (options: any) => {
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

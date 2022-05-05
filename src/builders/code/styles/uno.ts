import { defineConfig } from 'unocss'
export type UnoConfig = ReturnType<typeof defineConfig>
// import { heading } from './heading'

export default (): UnoConfig => defineConfig({
  shortcuts: [
    [
      /^heading$/,
      (_args: string[]) => {
        return 'bg-gray-200 dark:bg-gray-800 text-lg px-2 py-1'
      },
    ],
    [
      /^code-wrapper$/,
      () => 'bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col space-y-0',
    ],
    [
      /^code-block$/,
      () => 'flex flex-col space-y-0',
    ],

  ],
})

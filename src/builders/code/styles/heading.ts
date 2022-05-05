// import type { DynamicShortcut, presetUno } from 'unocss'

const regexp = /^heading$/

const handler = (_args: string[]) => {
  return 'bg-gray-200 dark:bg-gray-800'
}

export const heading = [
  regexp,
  handler,
  { autocomplete: 'heading' },
]

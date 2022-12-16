import { composeSfcBlocks } from '../../src/pipeline'
import type { Options } from '../../src/types'

export const composeMarkdown = async <O extends Options<any>>(markdown: string, options: O = {} as O) => {
  return composeSfcBlocks(
    'test-with-raw-markdown',
    markdown,
    options,
  )
}

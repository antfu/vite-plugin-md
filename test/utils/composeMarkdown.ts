import { composeSfcBlocks } from '../../src/pipeline'
import type { Options } from '../../src/types'

export const composeMarkdown = async <O extends Partial<Options<readonly any[] | readonly[]>>>(markdown: string, options?: O) => {
  return composeSfcBlocks(
    'test-with-raw-markdown',
    markdown,
    options,
  )
}

import { describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src'
import { getFixture } from './utils'

describe('code block', async () => {
  const { templateBlock } = await composeSfcBlocks(
    'test/fixtures/ts-code-block.md',
    await getFixture('code-block.md'),
  )
  console.log(templateBlock)
})

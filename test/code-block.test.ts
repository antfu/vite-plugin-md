import { describe, expect, it } from 'vitest'
import { select, toHtml } from '@yankeeinlondon/happy-wrapper'
import { composeSfcBlocks } from '../src'
import { getFixture } from './utils'

describe('code block', () => {
  it('', async () => {
    const { templateBlock } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('code-block.md'),
    )

    const html = select(templateBlock)
    const pre = html.findFirst('pre')

    expect(true).toBeTruthy()
    expect(pre).toBeDefined()
    if (pre) {
      expect(toHtml(pre)).toContain('import dotenv from')
      expect(toHtml(pre)).toContain('dotenv.config({')
    }
  })
})

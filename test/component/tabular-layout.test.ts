import { describe, expect, it } from 'vitest'
import { mountFixtureWithRouter } from '../utils'

describe('loading a page with tabular format correctly presents', () => {
  it('load a markdown file with a code block', async () => {
    const { mountPoint } = await mountFixtureWithRouter('../fixtures/simple.md')

    const h1 = mountPoint.find('h1')
    const pre = mountPoint.find('pre')
    const codeWrapper = mountPoint.find('.code-wrapper')

    expect(h1).toBeDefined()
    expect(pre).toBeDefined()
    expect(codeWrapper).toBeDefined()
  })
})

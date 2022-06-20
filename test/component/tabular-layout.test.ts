import { describe, expect, it } from 'vitest'
import { mountFixtureWithRouter } from '../utils'

describe('loading a page with tabular format correctly presents', () => {
  it('load a markdown file with a code block', async () => {
    const { wrapper } = await mountFixtureWithRouter('../fixtures/simple.md')

    const h1 = wrapper.find('h1')
    const pre = wrapper.find('pre')
    const codeWrapper = wrapper.find('.code-wrapper')

    expect(h1).toBeDefined()
    expect(pre).toBeDefined()
    expect(codeWrapper).toBeDefined()
  })
})

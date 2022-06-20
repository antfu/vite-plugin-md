import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('override frontmatter values', () => {
  it('override callback has ability to modify frontmatter to it\'s liking', async () => {
    const sfc = await composeFixture('simple', {
      frontmatterDefaults: {
        title: 'default title',
      },
      frontmatterOverrides: {
        title: 'overridden title',
      },
    })
    expect(sfc.frontmatter.title).toBe('overridden title')
  })
})

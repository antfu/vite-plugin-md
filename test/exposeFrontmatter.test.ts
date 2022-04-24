
import { describe, expect, it } from 'vitest'
// import { composeFixture, mountFixture } from './utils'
// import MD from './fixtures/simple.md'

describe('exposeFrontmatter exposes "frontmatter" property', () => {
  it('can import a markdown file from the filesystem', async() => {
    const c = await import('./fixtures/simple.md')
    expect(c).toBeDefined()
  })
})

import { describe, expect, it } from 'vitest'
import { composeFixture, mountFixture } from '../utils'

describe('Async import of components and exposed variables', () => {
  it('direct import of frontmatter', async () => {
    const t = await mountFixture('../fixtures/simple.md')
    expect(t.frontmatter).toBeDefined()
    expect(t.frontmatter.title).toBe('Hello World')
  })

  it('both frontmatter and excerpt available', async () => {
    const t = await mountFixture('../fixtures/excerpt-default.md')
    const sfc = await composeFixture('excerpt-default', {
      exposeExcerpt: true,
      excerpt: true,
    })

    expect(sfc.excerpt).toBeDefined()
    expect(t.frontmatter.title).toBe('Excerpt Default')
    expect(t.excerpt).toContain(sfc.excerpt)
  })

  it.skip('a markdown file can import another and get metadata props', async () => {
    // TODO: this isn't working yet but I think it can/should once the file paths are
    // setup correctly for ViteJS to resolve path; would like to be able to resolve both
    // relative and fully qualified paths (where fully qualified is based on router config)
    const t = await mountFixture('../fixtures/using-frontmatter.md')
    expect(t.wrapper).toBeDefined()
  })
})

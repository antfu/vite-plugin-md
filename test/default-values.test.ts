import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('frontmatter default values', () => {
  it('setting static and callback based default values works', async () => {
    const sfc = await composeFixture('route-meta-custom', {
      frontmatterDefaults: (fm, file) => ({
        foo: 'bar',
        title: 'default title',
        requiresAuth: !!file.includes('secure'),
      }),
    })

    expect(sfc.frontmatter.foo).toBe('bar') // no page value
    expect(sfc.frontmatter.title).toBe('Metadata for your Route') // overridden
    expect(sfc.frontmatter.requiresAuth).toBe(true) // overridden

    const sfc2 = await composeFixture('meta', {
      frontmatterDefaults: (fm, file) => ({
        requiresAuth: !!file.includes('secure'),
      }),
    })
    expect(sfc2.frontmatter.requiresAuth).toBe(false) // callback used

    const sfc3 = await composeFixture('secure', {
      frontmatterDefaults: (fm, file) => ({
        requiresAuth: !!file.includes('secure'),
      }),
    })
    expect(sfc3.frontmatter.requiresAuth).toBe(true) // callback used
  })
})

import { unlink, writeFile } from 'fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

const fixtures = [
  'simple',
  'ts-code-block',
  'links',
  'has-css',
  'get-the-picture',
  'highlight-multi-block',
  'route-meta-custom',
]

describe('generate temporary SFCs and ensure they can be imported', () => {
  // write temp SFCs to fixtures directory
  beforeAll(async () => {
    for (const f of fixtures) {
      const { component } = await composeFixture(f)
      const filename = `./test/fixtures/${f}.vue`

      await writeFile(filename, component, { encoding: 'utf8', flag: 'w' })
    }
  })

  // cleanup temp SFCs
  afterAll(async () => {
    for (const f of fixtures)
      await unlink(`./test/fixtures/${f}.vue`)
  })

  for (const f of fixtures) {
    it(`SFCs for "${f}" can be imported`, async () => {
      const c = await import(`test/fixtures/${f}.vue`)
      expect(c.default, `default export not found for "${f}"`).toBeDefined()
      expect(c.frontmatter, `frontmatter not found for "${f}"`).toBeDefined()
      expect(typeof c.default.setup).toBe('function')
      expect(c.default.__name).toBe(f)
      expect(typeof c.frontmatter).toBe('object')
    })
  }
})

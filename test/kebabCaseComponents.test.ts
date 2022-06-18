import { select } from '@yankeeinlondon/happy-wrapper'
import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('PascalCase to kebab-case components', () => {
  it('PascalCase block element is converted to kebab-case', async () => {
    const { html } = await composeFixture('pascal-case')

    const preCode = select(html).findFirst('pre>code', 'did not find <pre><code>!')
    expect(preCode.innerHTML).toContain('FooBar')

    expect(html).toContain('PascalCase')

    const kebab = select(html)
      .findFirst(
        '.yuck',
        'couldn\'t find the class "yuck" which is need to look for kebab-case transform!',
      )
    expect(kebab.tagName.toLowerCase()).toBe('foo-bar')
  })
})


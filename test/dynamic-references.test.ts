import { describe, expect, it } from 'vitest'
import { getAttribute, select } from '../src/builders/code/utils'
import { composeFixture } from './utils'

const alt = getAttribute('alt')
const src = getAttribute('src')
const href = getAttribute('href')

describe('loading images and links from frontmatter props', () => {
  it('locally referenced image', async() => {
    const { html } = await composeFixture('get-the-picture')
    const sel = select(html).findFirst('img')
    expect(alt(sel)).toBe('local cat')
    expect(src(sel)).toBe('{{localCat}}')
  })

  it('externally referenced image', async() => {
    const { html } = await composeFixture('get-the-picture')
    const sel = select(html).findAll('img')[1]
    expect(alt(sel)).toBe('remote cat')
    expect(src(sel)).toBe('{{remoteCat}}')
  })

  it('frontmatter based link has retains curly brackets', async() => {
    const { html } = await composeFixture('get-the-picture')
    const sel = select(html).findFirst('a')
    expect(href(sel)).toBe('{{catLink}}')
  })

  it('snapshot test', async() => {
    const { html } = await composeFixture('get-the-picture')

    expect(html).toMatchSnapshot()
  })
})

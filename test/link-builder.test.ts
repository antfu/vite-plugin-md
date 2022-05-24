import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { composeSfcBlocks } from '../src/pipeline'
import { link } from '../src/index'

const window = new Window()
const document = window.document

let md = ''

describe('link testing', () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/links.md', 'utf-8')
  })

  it('component snapshot is consistent', async () => {
    const sfc = await composeSfcBlocks('links.md', md, { builders: [link()] })
    expect(sfc.component).toMatchSnapshot()
  })

  it('class links are found in HTML text', async () => {
    const { html } = await composeSfcBlocks('links.md', md, { builders: [link()] })
    expect(html.includes('internal-link')).toBeTruthy()
    expect(html.includes('external-link')).toBeTruthy()
  })

  it('internal and external classes are found in DOM', async () => {
    const sfc = await composeSfcBlocks('links.md', md, { builders: [link()] })

    document.body.innerHTML = sfc.html
    const internalLinks = document.querySelectorAll('.internal-link')
    const externalLinks = document.querySelectorAll('.external-link')

    for (const l of internalLinks)
      expect(l.classList.value, `class list should have had "internal-link": ${l.classList.value}`).toContain('internal-link')

    expect(internalLinks.map(i => i.textContent)).toContain('internal link')
    expect(internalLinks.map(i => i.textContent)).not.toContain('external link')

    for (const l of externalLinks)
      expect(l.classList.value, `class list should have had "external-link": ${l.classList.value}`).toContain('external-link')

    expect(externalLinks.map(i => i.textContent)).toContain('external link')
    expect(externalLinks.map(i => i.textContent)).not.toContain('internal link')
  })

  it('content-type classes are brought in appropriately', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc.html
    const imageLinks = document.querySelectorAll('.image-reference')
    const docLinks = document.querySelectorAll('.doc-reference')
    const mailTo = document.querySelectorAll('.mailto-link')

    expect(imageLinks.map(i => i.textContent)).toContain('images')
    expect(docLinks.map(i => i.textContent)).toContain('documents')
    expect(mailTo.map(i => i.textContent)).toContain('contact us')
  })

  it('custom rules add classes as expected', async () => {
    const sfc = await composeSfcBlocks('', md, {
      builders: [link({
        ruleBasedClasses: [[/colors\.com/, 'colorful']],
      })],
    })

    document.body.innerHTML = sfc.html

    const colorful = document.querySelectorAll('.colorful')

    expect(colorful.length).toBe(3)
    expect(colorful.map(i => i.textContent)).toContain('red')
    expect(colorful.map(i => i.textContent)).toContain('blue')
    expect(colorful.map(i => i.textContent)).toContain('green')
  })

  it('internal index route reference to a markdown file is cleaned up', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [link({ useRouterLinks: false })] })
    document.body.innerHTML = sfc.html
    const internal = document.querySelectorAll('.internal-link')
    const indexRoute = internal.find(i => i.textContent === 'index route')
    expect(indexRoute).not.toBeUndefined()
    expect(indexRoute?.getAttribute('href')).toEqual('/foobar/')

    // double check that conversion to router link works in the same way
    const sfc2 = await composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc2.html
    const internal2 = document.querySelectorAll('.internal-link')
    const indexRoute2 = internal2.find(i => i.textContent === 'index route')
    expect(indexRoute2).not.toBeUndefined()
    expect(indexRoute2?.getAttribute('href')).toBeNull()
    expect(indexRoute2?.getAttribute('to')).toEqual('/foobar/')
  })

  it('internal non-index route with MD in href is shortened to route path', async () => {
    const sfc = await composeSfcBlocks('repo/src/pages/current.md', md, { builders: [link({ useRouterLinks: false })] })
    document.body.innerHTML = sfc.html
    const internal = document.querySelectorAll('.internal-link')
    const nonIndexRoute = internal.find(i => i.textContent === 'non-index route')
    expect(nonIndexRoute).not.toBeUndefined()
    expect(nonIndexRoute?.getAttribute('href')).toEqual('foo/bar')
  })

  it('external routes with .md reference are left as is', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc.html
    const external = document.querySelectorAll('.external-link')
    const indexRoute = external.find(i => i.textContent === 'external index routes')
    expect(indexRoute).not.toBeUndefined()
    expect(indexRoute?.getAttribute('href')).toEqual('https://dev.null/foo/index.md')

    const nonIndexRoute = external.find(i => i.textContent === 'external non-index routes')
    expect(nonIndexRoute).not.toBeUndefined()
    expect(nonIndexRoute?.getAttribute('href')).toEqual('https://dev.null/foo/bar.md')
  })

  it('"base" option set changes link resolution for relative links', async () => {
    const sfc = await composeSfcBlocks('', md, {
      builders: [
        link({ relativeLinkClass: 'relative-link' }),
      ],
    }, { base: 'one' })
    document.body.innerHTML = sfc.html

    const links = document.querySelectorAll('.relative-link')
    expect(links.length).toBeGreaterThan(0)

    for (const l of links) {
      expect(
        l.getAttribute('to').startsWith('one'),
        `when we have a "base" of "one" all internal URLs should start with that URL but the URL was "${l.getAttribute('to')}"\n`,
      ).toBeTruthy()
    }
  })

  it('"base" option set changes link resolution for fully qualified local links', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [link({ fullyQualifiedLinkClass: 'fq-link' })] }, { base: 'one' })
    document.body.innerHTML = sfc.html

    const links = document.querySelectorAll('.fq-link')
    expect(links.length).toBeGreaterThan(0)

    for (const l of links) {
      expect(
        l.getAttribute('to').startsWith('one'),
        `when we have a "base" of "foo" all internal URLs should start with that URL. Url was:  ${l.getAttribute('to')}\n`,
      ).toBeTruthy()
    }
  })

  it('internal routes are converted to `<router-link>` elements by default', async () => {
    const sfc = await composeSfcBlocks('test/fixtures/links.md', md, { builders: [link()] })
    document.body.innerHTML = sfc.html

    const internal = document.querySelectorAll('.internal-link')
    const router = document.querySelectorAll('.router-link')

    expect(internal.length).toEqual(router.length)

    router.forEach(t =>
      expect(t.tagName, 'the tagname should have been converted from <a> to <router-link>').toEqual('ROUTER-LINK'),
    )
    router.forEach(t =>
      expect(t.getAttribute('href'), 'the "href" should be empty in favor of a "to" prop').toBeNull(),
    )
    router.forEach(t =>
      expect(t.getAttribute('to'), 'the "to" property should be set for <router-link>').toBeTypeOf('string'))
  })

  it('the "_base" attribute is removed prior to rendering HTML of router links', async () => {
    const sfc = await composeSfcBlocks(
      'test/fixtures/links.md',
      md,
      {
        builders: [link()],
      },
    )
    document.body.innerHTML = sfc.html

    const router = document.querySelectorAll('.router-link')

    router.forEach(t =>
      expect(t.getAttribute('_base'), 'the _base attribute is set during the build process to ensure a relative path but should be removed in final rendering').toBeNull(),
    )
  })

  it('router links which are relative are resolved to a valid route', async () => {
    const sfc = await composeSfcBlocks(
      'test/fixtures/links.md',
      md,
      {
        builders: [link()],
      },
    )
    document.body.innerHTML = sfc.html

    const router = document.querySelectorAll('.router-link')

    router.forEach(t => expect(t.getAttribute('to').startsWith('test/fixtures')))
  })

  it('router links add in "base" when present', async () => {
    const sfc = await composeSfcBlocks(
      'test/fixtures/links.md',
      md,
      {
        builders: [link()],
      },
      { base: 'foobar' },
    )
    document.body.innerHTML = sfc.html

    const router = document.querySelectorAll('.router-link')

    router.forEach(t => expect(t.getAttribute('to').startsWith('foobar/test/fixtures')))
  })
})

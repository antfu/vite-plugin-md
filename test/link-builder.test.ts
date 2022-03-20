/* eslint-disable no-console */
import { readFile } from 'fs/promises'
import { ref } from 'vue'
import { beforeAll, describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { composeSfcBlocks } from '../src/pipeline'
import { link } from '../src/index'

const window = new Window()
const document = window.document

let md = ''

describe('link testing', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/links.md', 'utf-8')
  })

  it('internal and external classes are brought in appropriately', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link()] })
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

  it('content-type classes are brought in appropriately', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc.html
    const imageLinks = document.querySelectorAll('.image-reference')
    const docLinks = document.querySelectorAll('.doc-reference')
    const mailTo = document.querySelectorAll('.mailto-link')

    expect(imageLinks.map(i => i.textContent)).toContain('images')
    expect(docLinks.map(i => i.textContent)).toContain('documents')
    expect(mailTo.map(i => i.textContent)).toContain('contact us')
  })

  it('custom rules add classes as expected', () => {
    const sfc = composeSfcBlocks('', md, {
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

  it('internal index route reference to a markdown file is cleaned up', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link({ useRouterLinks: false })] })
    document.body.innerHTML = sfc.html
    const internal = document.querySelectorAll('.internal-link')
    const indexRoute = internal.find(i => i.textContent === 'index route')
    expect(indexRoute).not.toBeUndefined()
    expect(indexRoute?.getAttribute('href')).toEqual('/foobar/')

    // double check that conversion to router link works in the same way
    const sfc2 = composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc2.html
    const internal2 = document.querySelectorAll('.internal-link')
    const indexRoute2 = internal2.find(i => i.textContent === 'index route')
    expect(indexRoute2).not.toBeUndefined()
    expect(indexRoute2?.getAttribute('href')).toBeNull()
    expect(indexRoute2?.getAttribute('to')).toEqual('/foobar/')
  })

  it('internal non-index route with MD in href is shortened to route path', () => {
    const sfc = composeSfcBlocks('repo/src/pages/current.md', md, { builders: [link({ useRouterLinks: false })] })
    document.body.innerHTML = sfc.html
    const internal = document.querySelectorAll('.internal-link')
    const nonIndexRoute = internal.find(i => i.textContent === 'non-index route')
    expect(nonIndexRoute).not.toBeUndefined()
    expect(nonIndexRoute?.getAttribute('href')).toEqual('foo/bar')
  })

  it('external routes with .md reference are left as is', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc.html
    const external = document.querySelectorAll('.external-link')
    const indexRoute = external.find(i => i.textContent === 'external index routes')
    expect(indexRoute).not.toBeUndefined()
    expect(indexRoute?.getAttribute('href')).toEqual('https://dev.null/foo/index.md')

    const nonIndexRoute = external.find(i => i.textContent === 'external non-index routes')
    expect(nonIndexRoute).not.toBeUndefined()
    expect(nonIndexRoute?.getAttribute('href')).toEqual('https://dev.null/foo/bar.md')
  })

  it('"base" option set changes link resolution for relative links', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link({ relativeLinkClass: 'relative-link' })] }, { base: 'one' })
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

  it('"base" option set changes link resolution for fully qualified local links', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link({ fullyQualifiedLinkClass: 'fq-link' })] }, { base: 'one' })
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

  it.todo('reactive "path" adjusts relative links', () => {
    const path = ref('foo/bar/baz')
  })

  it('internal routes are converted to `<router-link>` elements by default', () => {
    const sfc = composeSfcBlocks('', md, { builders: [link()] })
    document.body.innerHTML = sfc.html

    const internal = document.querySelectorAll('.internal-link')
    const router = document.querySelectorAll('.router-link')

    expect(internal.length).toEqual(router.length)

    internal.forEach(t =>
      expect(t.tagName, 'the tagname should have been converted from <a> to <router-link>').toEqual('ROUTER-LINK'),
    )
    internal.forEach(t =>
      expect(t.getAttribute('href'), 'the "href" should be empty in favor of a "to" prop').toBeNull(),
    )
    internal.forEach(t =>
      expect(t.getAttribute('to'), 'the "to" property should be set for <router-link>').toBeTypeOf('string'))
  })
})

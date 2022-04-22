import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { code } from '../src'
import { select } from '../src/builders/code/utils'
import { composeSfcBlocks } from '../src/pipeline'
import { composeFixture, getFixture } from './utils'
// import MD, { frontmatter } from './test/fixtures/using-frontmatter.md'

let md = ''
const defineExposeFound = /defineExpose\({ frontmatter }\)/
const vue2ExposeFound = /export default { data\(\) { return { frontmatter } } }/

describe('exposeFrontmatter property', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })
  it('Vue3 -- when exposeFrontmatter set to true -- uses defineExpose method to expose to other components', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true })
    expect(defineExposeFound.test(scriptBlock)).toBeTruthy()
    expect(vue2ExposeFound.test(scriptBlock)).toBeFalsy()
    expect(scriptBlock).toMatchSnapshot()
  })

  // it('markdown files offer frontmatter properties for import', async() => {
  //   const { frontmatter: fm } = await composeFixture('using-frontmatter')
  //   const { frontmatter: fm } = await composeSfcBlocks(
  //     'test/fixtures/use-markdown.md',
  //     (await getFixture('using-frontmatter.md')),
  //     { builders: [code()] },
  //   )

  //   expect(MD).toBeDefined()
  //   expect(frontmatter).toBe(fm)
  // })

  it('headings and image source can be taken from frontmatter properties', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/use-markdown.md',
      (await getFixture('external-reference-inline.md')),
      { builders: [code()] },
    )

    const sel = select(html)
    expect(sel.findFirst('image')?.getAttribute('src')).toBe('/images/foobar.jpg')
  })

  it('Vue3 -- when exposeFrontmatter set to false -- does NOT use defineExpose to expose frontmatter', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false })
    expect(defineExposeFound.test(scriptBlock)).toBeFalsy()
    expect(vue2ExposeFound.test(scriptBlock)).toBeFalsy()
    expect(scriptBlock).toMatchSnapshot()
  })

  it('Vue2 -- when exposeFrontmatter set to true -- does NOT use defineExpose method from Vue3 but does expose frontmattter', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true, vueVersion: '2.0' })
    expect(defineExposeFound.test(scriptBlock)).toBeFalsy()
    expect(vue2ExposeFound.test(scriptBlock)).toBeTruthy()
    expect(scriptBlock).toMatchSnapshot()
  })

  it('Vue2 -- when exposeFrontmatter set to false -- does NOT use defineExpose method from Vue3', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false, vueVersion: '2.0' })
    expect(defineExposeFound.test(scriptBlock)).toBeFalsy()
    expect(vue2ExposeFound.test(scriptBlock)).toBeFalsy()

    expect(scriptBlock).toMatchSnapshot()
  })
})

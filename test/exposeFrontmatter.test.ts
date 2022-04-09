import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'

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

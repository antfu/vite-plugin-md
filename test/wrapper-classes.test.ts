import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

describe('Wrapper classes work as expected', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })

  it('default config results in correct wrapper class', async() => {
    const sfc = composeSfcBlocks('wrapper.md', md)
    expect(sfc.html).toContain('markdown-body')
  })

  it('changing the value of the \'wrapperClasses\' configuration is reflected in the resulting HTML output', () => {
    const sfc = composeSfcBlocks('wrapper.md', md, { wrapperClasses: 'test-wrap' })
    expect(sfc.html).toContain('test-wrap')
    expect(sfc.html).not.toContain('markdown-body')
  })

  it('changing the value of the \'wrapperClasses\' config to include multiple classes', () => {
    const sfc = composeSfcBlocks('wrapper.md', md, { wrapperClasses: 'prose m-auto' })
    expect(sfc.html).toContain('prose m-auto')
    expect(sfc.html).not.toContain('markdown-body')
  })

  it('changing the value of the \'wrapperClasses\' config along with \'wrapperComponent\'', () => {
    const sfc = composeSfcBlocks('wrapper.md', md, { wrapperClasses: 'prose m-auto', wrapperComponent: 'post' })
    expect(sfc.html).toContain('prose m-auto')
    expect(sfc.html).not.toContain('markdown-body')
  })
})

describe('Snapshots for wrapper-testing', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })

  it('html is consistent for default config', () => {
    const { html } = composeSfcBlocks('/foobar/meta.md', md)
    expect(html).toMatchSnapshot()
  })

  it('html is consistent for explicit config', () => {
    const { html } = composeSfcBlocks('wrapper.md', md, { wrapperClasses: 'prose m-auto', wrapperComponent: 'post' })
    expect(html).toMatchSnapshot()
  })
})

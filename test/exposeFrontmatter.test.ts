import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import { composeFixture, getFixture } from './utils'
// import MD, { frontmatter } from './test/fixtures/using-frontmatter.md'

let md = ''

const extractScriptSetup = (component: string) => component.replace(/.*(<script setup.*>.*<\/script>).*<script.*$/s, '$1')
const extractScriptBlock = (component: string) => component.replace(/.*(<script setup.*<script.*)$/s, '$1')

describe('exposeFrontmatter exposes "frontmatter" property', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })
  it('Vue3/expose true', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true })
    const scriptSetup = extractScriptSetup(scriptBlock)
    const script = extractScriptBlock(scriptBlock)

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')

    expect(script).toContain('export const frontmatter')
  })

  it('Vue3/expose false', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false })

    const scriptSetup = extractScriptSetup(scriptBlock)
    const script = extractScriptBlock(scriptBlock)
    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(script).not.toContain('export const frontmatter')
  })

  it('Vue2/expose true', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true, vueVersion: '2.0' })

    const script = extractScriptBlock(scriptBlock)
    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).toContain('export const frontmatter')
  })

  it('Vue2/expose false', async() => {
    const { scriptBlock } = await composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false, vueVersion: '2.0' })
    const script = extractScriptBlock(scriptBlock)
    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).not.toContain('export const frontmatter')
  })
})

describe('exposeFrontmatter snapshots', () => {
  it('vue3', () => {
    const { component } = composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true })
    expect(component).toMatchSnapshot()
  })
  it('vue3 (no expose)', () => {
    const { component } = composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false })
    expect(component).toMatchSnapshot()
  })

  it('vue2', () => {
    const { component } = composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: true, vueVersion: '2.0' })
    expect(component).toMatchSnapshot()
  })
  it('vue2 (no expose)', () => {
    const { component } = composeSfcBlocks('test/fixtures/simple.md', md, { exposeFrontmatter: false, vueVersion: '2.0' })
    expect(component).toMatchSnapshot()
  })
})

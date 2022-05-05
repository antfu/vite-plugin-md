import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

const extractScriptSetup = (component: string) =>
  component.replace(/.*(<script setup.*>.*<\/script>).*<script.*$/s, '$1')
const extractScriptBlock = (component: string) =>
  component.replace(/.*(<script setup.*<script.*)$/s, '$1')

describe('exposeFrontmatter exposes "frontmatter" property', () => {
  it.skip('a markdown file can import another and get metadata props', async () => {
    // const first = await mountFixture('using-frontmatter')
    // const dep = await composeFixture('simple')

    // expect(first().html(), first().html()).toContain(`Simple: ${dep.frontmatter.description}`)
  })
  it('Vue3/expose true', async () => {
    const { scriptBlock } = await composeFixture('simple.md', { exposeFrontmatter: true })
    const scriptSetup = extractScriptSetup(scriptBlock)
    const script = extractScriptBlock(scriptBlock)

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')

    expect(script).toContain('export const frontmatter')
  })

  it('Vue3/expose false', async () => {
    const { scriptBlock } = await composeFixture('simple.md', { exposeFrontmatter: false })

    const scriptSetup = extractScriptSetup(scriptBlock)
    const script = extractScriptBlock(scriptBlock)
    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(script).not.toContain('export const frontmatter')
  })

  it('Vue2/expose true', async () => {
    const { scriptBlock } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2.0' })

    const script = extractScriptBlock(scriptBlock)
    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).toContain('export const frontmatter')
  })

  it('Vue2/expose false', async () => {
    const { scriptBlock } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2.0' })
    const script = extractScriptBlock(scriptBlock)
    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).not.toContain('export const frontmatter')
  })
})

describe('exposeFrontmatter snapshots', () => {
  it('vue3', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: true })
    expect(component).toMatchSnapshot()
  })
  it('vue3 (no expose)', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: false })
    expect(component).toMatchSnapshot()
  })

  it('vue2', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2.0' })
    expect(component).toMatchSnapshot()
  })
  it('vue2 (no expose)', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2.0' })
    expect(component).toMatchSnapshot()
  })
})

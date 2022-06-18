import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('exposeFrontmatter exposes "frontmatter" property', () => {
  it('Vue3/expose true', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: true })

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(scriptBlocks.join('\n')).toContain('export const frontmatter')
  })

  it('Vue3/expose false', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: false })

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(scriptBlocks.join('\n')).not.toContain('export const frontmatter')
  })

  it('Vue2/expose true', async () => {
    const { scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2' })
    const script = scriptBlocks.join('\n')

    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).toContain('export const frontmatter')
  })

  it('Vue2/expose false', async () => {
    const { scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2' })
    const script = scriptBlocks.join('\n')

    expect(script, `Could not find 'title' in:\n"${script}"\n`).toContain('export const title')
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
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2' })
    expect(component).toMatchSnapshot()
  })
  it('vue2 (no expose)', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2' })
    expect(component).toMatchSnapshot()
  })
})


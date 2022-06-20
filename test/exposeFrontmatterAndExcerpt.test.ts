import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('exposeFrontmatter exposes "frontmatter" property', () => {
  it('Vue3/expose frontmatter true', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: true })

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(scriptBlocks.join('\n')).toContain('export const frontmatter')
  })

  it('Vue3/expose excerpt true', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { excerpt: true })

    expect(scriptSetup).toContain('const excerpt')
    expect(scriptSetup).not.toContain('export const excerpt')
    expect(scriptBlocks.join('\n')).toContain('export const excerpt')
  })

  it('Vue3/expose frontmatter false', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: false })

    expect(scriptSetup).toContain('const title')
    expect(scriptSetup).not.toContain('export const title')
    expect(scriptSetup).toContain('const description')
    expect(scriptBlocks.join('\n')).toContain('export const frontmatter: Frontmatter = {}')
  })

  it('Vue2/expose frontmatter true', async () => {
    const { scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2.' })
    const script = scriptBlocks.join('\n')

    expect(script).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).toContain('export const frontmatter')
  })

  it('Vue2/expose frontmatter false', async () => {
    const { scriptSetup, scriptBlocks } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2.' })

    expect(scriptSetup).toBe('')
    const script = scriptBlocks.join('\n')

    expect(script, `Could not find 'title' in:\n"${script}"\n`).toContain('export const title')
    expect(script).toContain('export const description')
    expect(script).toContain('export const frontmatter: Frontmatter = {}')
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
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: true, vueVersion: '2.' })
    expect(component).toMatchSnapshot()
  })
  it('vue2 (no expose)', async () => {
    const { component } = await composeFixture('simple.md', { exposeFrontmatter: false, vueVersion: '2.' })
    expect(component).toMatchSnapshot()
  })
})


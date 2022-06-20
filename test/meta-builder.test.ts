import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'
import { meta } from '../src/index'
import type { Options } from '../src/types'
import { composeSfcBlocks } from '../src/pipeline'
import { composeFixture } from './utils'

let md = ''

describe('use "meta" builder for frontmatterPreprocess', async () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('with no config, doc props all available as frontmatter props and other meta props get default mapping', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [meta()] })

    expect(sfc.frontmatter.title).toEqual('Metadata Rules')
    expect(sfc.frontmatter.byline).toEqual('who loves ya baby?')
    expect(sfc.frontmatter.layout).toEqual('yowza')
    expect(sfc.frontmatter.image).toEqual('facebook.png')

    expect(sfc.head.title).toEqual('Metadata Rules')
    expect(sfc.routeMeta?.meta?.layout).toEqual('yowza')
    expect(sfc.meta.find(p => p.key === 'title')).toBeDefined()
    expect(sfc.meta.find(p => p.key === 'image')).toBeDefined()
  })

  it('default value is used when no frontmatter is present', async () => {
    const options: Options = {
      frontmatterDefaults: {
        title: 'nada',
        description: 'there I was, there I was',
      },
      builders: [
        meta(),
      ],
    }
    const sfc = await composeSfcBlocks('', md, resolveOptions(options))

    expect(
      sfc.frontmatter.title,
      'default value should have been ignored in favor of page value',
    ).toBe('Metadata Rules')

    expect(
      sfc.frontmatter.description,
      `default value should have presented, found: ${sfc.frontmatter}`,
    ).toBe('there I was, there I was')

    expect(
      sfc.meta.find(i => i.key === 'description'),
      'description, as a default value, should now be in meta props',
    ).toBeDefined()
  })

  it('frontmatter props exported', async () => {
    const { component } = await composeFixture('meta')

    expect(component.includes('const title')).toBeTruthy()
    expect(component.includes('const byline')).toBeTruthy()
    expect(component.includes('const layout')).toBeTruthy()
    expect(component.includes('const image')).toBeTruthy()

    expect(component.includes('const frontmatter')).toBeTruthy()
    expect(component.includes('export const frontmatter')).toBeTruthy()
    expect(component.includes('defineExpose({ ')).toBeTruthy()
  })
})

describe('meta() can manage route meta', () => {
  it('router not brought into script section when Markdown doesn\'t have route meta', async () => {
    const { scriptSetup } = await composeFixture('simple', { builders: [meta()] })

    expect(scriptSetup).not.toContain('useRouter')
  })

  it('router IS imported when a a \'route prop\' is defined in frontmatter', async () => {
    const { scriptSetup, frontmatter } = await composeFixture('meta', { builders: [meta()] })
    expect(frontmatter.layout).toBeDefined()
    expect(scriptSetup).toContain('useRouter')
  })

  it('using routeName callback ensures that router is imported and route name is set', async () => {
    const { frontmatter, scriptSetup } = await composeFixture('no-route', {
      builders: [meta({
        routeName: (filename, fm) => fm.title ? `bespoke-${fm.title}` : 'nada',
      })],
    })

    expect(frontmatter.title).toBe('NoRoute')
    expect(scriptSetup, 'should have included an import of useRouter!').toContain('useRouter')
    expect(
      scriptSetup,
      `The scriptSetup block was:\n${scriptSetup}\n\n`,
    ).toContain('router.currentRoute.value.name = "bespoke-NoRoute"')
  })
})

describe('meta() snapshots', async () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('frontmatter is consistent', async () => {
    const { frontmatter } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(frontmatter).toMatchSnapshot()
  })

  it('HTML is consistent', async () => {
    const { html } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(html).toMatchSnapshot()
  })

  it('script blocks are consistent', async () => {
    const { scriptBlocks } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(scriptBlocks).toMatchSnapshot()
  })

  it('custom blocks are consistent', async () => {
    const { customBlocks } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(customBlocks).toMatchSnapshot()
  })
})

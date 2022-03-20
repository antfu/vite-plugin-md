import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'
import { meta } from '../src/index'
import type { Options } from '../src/@types'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

describe('use "meta" builder for frontmatterPreprocess', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('with no config, doc props all available as frontmatter props and other meta props get default mapping', () => {
    const sfc = composeSfcBlocks('', md, { builders: [meta()] })

    expect(sfc.frontmatter.title).toEqual('Metadata Rules')
    expect(sfc.frontmatter.byline).toEqual('who loves ya baby?')
    expect(sfc.frontmatter.layout).toEqual('yowza')
    expect(sfc.frontmatter.image).toEqual('facebook.png')

    expect(sfc.head.title).toEqual('Metadata Rules')
    expect(sfc.routeMeta.layout).toEqual('yowza')
    expect(sfc.meta.find(p => p.key === 'title')).toBeDefined()
    expect(sfc.meta.find(p => p.key === 'image')).toBeDefined()
  })

  it('default value is used when no frontmatter is present', () => {
    const options: Options = {
      builders: [
        meta({
          defaults: {
            title: 'nada',
            description: 'there I was, there I was',
          },
        }),
      ],
    }
    const sfc = composeSfcBlocks('', md, resolveOptions(options))

    expect(
      sfc.frontmatter.title,
      'default value should have been ignored in favor of page value',
    ).toBe('Metadata Rules')

    expect(
      sfc.frontmatter.description,
      'default value should have presented',
    ).toBe('there I was, there I was')

    expect(
      sfc.meta.find(i => i.key === 'description'),
      'description, as a default value, should now be in meta props',
    ).toBeDefined()
  })

  it('frontmatter props exported', () => {
    const output = composeSfcBlocks('', md).component

    expect(output.includes('const title')).toBeTruthy()
    expect(output.includes('const byline')).toBeTruthy()
    expect(output.includes('const layout')).toBeTruthy()
    expect(output.includes('const image')).toBeTruthy()

    expect(output.includes('const frontmatter')).toBeTruthy()
    expect(output.includes('export const frontmatter')).toBeFalsy()
    expect(output.includes('defineExpose({ frontmatter })')).toBeTruthy()
  })
})

describe('meta() snapshots', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('frontmatter is consistent', () => {
    const { frontmatter } = composeSfcBlocks('/foobar/meta.md', md)
    expect(frontmatter).toMatchSnapshot()
  })

  it('HTML is consistent', () => {
    const { html } = composeSfcBlocks('/foobar/meta.md', md)
    expect(html).toMatchSnapshot()
  })

  it('script blocks are consistent', () => {
    const { scriptBlock } = composeSfcBlocks('/foobar/meta.md', md)
    expect(scriptBlock).toMatchSnapshot()
  })

  it('custom blocks are consistent', () => {
    const { customBlocks } = composeSfcBlocks('/foobar/meta.md', md)
    expect(customBlocks).toMatchSnapshot()
  })
})

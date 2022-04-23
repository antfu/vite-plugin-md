import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'
import { meta } from '../src/index'
import type { Options } from '../src/types'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

describe('use "meta" builder for frontmatterPreprocess', async() => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('with no config, doc props all available as frontmatter props and other meta props get default mapping', async() => {
    const sfc = await composeSfcBlocks('', md, { builders: [meta()] })

    expect(sfc.frontmatter.title).toEqual('Metadata Rules')
    expect(sfc.frontmatter.byline).toEqual('who loves ya baby?')
    expect(sfc.frontmatter.layout).toEqual('yowza')
    expect(sfc.frontmatter.image).toEqual('facebook.png')

    expect(sfc.head.title).toEqual('Metadata Rules')
    expect(sfc.routeMeta.layout).toEqual('yowza')
    expect(sfc.meta.find(p => p.key === 'title')).toBeDefined()
    expect(sfc.meta.find(p => p.key === 'image')).toBeDefined()
  })

  it('default value is used when no frontmatter is present', async() => {
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

  it('frontmatter props exported', async() => {
    const output = (await composeSfcBlocks('', md)).component

    expect(output.includes('const title')).toBeTruthy()
    expect(output.includes('const byline')).toBeTruthy()
    expect(output.includes('const layout')).toBeTruthy()
    expect(output.includes('const image')).toBeTruthy()

    expect(output.includes('const frontmatter')).toBeTruthy()
    expect(output.includes('export const frontmatter')).toBeTruthy()
    expect(output.includes('defineExpose({ ')).toBeTruthy()
  })
})

describe('meta() snapshots', async() => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('frontmatter is consistent', async() => {
    const { frontmatter } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(frontmatter).toMatchSnapshot()
  })

  it('HTML is consistent', async() => {
    const { html } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(html).toMatchSnapshot()
  })

  it('script blocks are consistent', async() => {
    const { scriptBlock } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(scriptBlock).toMatchSnapshot()
  })

  it('custom blocks are consistent', async() => {
    const { customBlocks } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(customBlocks).toMatchSnapshot()
  })
})

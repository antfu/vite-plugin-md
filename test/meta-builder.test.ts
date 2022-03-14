import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'
import { meta } from '../src/index'
import type { Options } from '../src/types'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

describe('use "meta" builder for frontmatterPreprocess', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('with no config, doc props all available as frontmatter props and other meta props get default mapping', () => {
    const options: Options = { frontmatterPreprocess: meta() }
    const sfc = composeSfcBlocks('', md, resolveOptions(options))

    expect(sfc.meta.frontmatter.title).toEqual('Metadata Rules')
    expect(sfc.meta.frontmatter.byline).toEqual('who loves ya baby?')
    expect(sfc.meta.frontmatter.layout).toEqual('yowza')
    expect(sfc.meta.frontmatter.image).toEqual('facebook.png')

    expect(sfc.meta.head.title).toEqual('Metadata Rules')
    expect(sfc.meta.routeMeta.layout).toEqual('yowza')
    expect(sfc.meta.metaProps.find(p => p.key === 'title')).toBeDefined()
    expect(sfc.meta.metaProps.find(p => p.key === 'image')).toBeDefined()
  })

  it('default value is used when no frontmatter is present', () => {
    const options: Options = {
      frontmatterPreprocess: meta({
        defaults: {
          title: 'nada',
          description: 'there I was, there I was',
        },
      }),
    }
    const sfc = composeSfcBlocks('', md, resolveOptions(options))

    expect(
      sfc.meta.frontmatter.title,
      'default value should have been ignored in favor of page value',
    ).toBe('Metadata Rules')

    expect(
      sfc.meta.frontmatter.description,
      'default value should have presented',
    ).toBe('there I was, there I was')

    expect(
      sfc.meta.metaProps.find(i => i.key === 'description'),
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

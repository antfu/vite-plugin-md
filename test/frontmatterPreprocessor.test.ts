import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import type { MetaProperty, ResolvedOptions } from '../src/types'

const frontmatterPreprocess: ResolvedOptions['frontmatterPreprocess'] = (fm) => {
  const frontmatter = {
    title: 'default title',
    description: 'default description',
    ...fm,
  }
  const meta: MetaProperty[] = [
    { property: 'og:title', name: 'twitter:title', itemprop: 'title', content: frontmatter.title },
    {
      property: 'og:description',
      name: 'twitter:description',
      itemprop: 'description',
      content: frontmatter.description,
    },
  ]
  return {
    head: { ...frontmatter, meta },
    frontmatter: { ...frontmatter, meta },
    metaProps: [],
    routeMeta: {},
  }
}

let md = ''

describe('frontmatter pre-processor', () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })

  it('frontmatter is unchanged', async () => {
    const { frontmatter } = await composeSfcBlocks('', md, { frontmatterPreprocess, headEnabled: true })
    expect(frontmatter).toMatchSnapshot()
  })

  it('head is unchanged', async () => {
    const { head } = await composeSfcBlocks('', md, { frontmatterPreprocess, headEnabled: true })
    expect(head).toMatchSnapshot()
  })

  it('meta props are unchanged', async () => {
    const { meta } = await composeSfcBlocks('', md, { frontmatterPreprocess, headEnabled: true })
    expect(meta).toMatchSnapshot()
  })

  it('inline markdown is used over default properties', async () => {
    const { frontmatter } = await composeSfcBlocks('', md, { frontmatterPreprocess, headEnabled: true })

    // Positive tests
    expect(
      frontmatter.title?.includes('Hello World'),
      'the title attribute is retained over the default \'title\' value',
    ).toBeTruthy()

    expect(
      frontmatter.description?.includes('testing is the path to true happiness'),
      'description property is also retained',
    ).toBeTruthy()

    // Negative tests
    expect(
      frontmatter.title?.includes('default title'),
      'the title attribute is retained over the default \'title\' value',
    ).toBeFalsy()

    expect(
      frontmatter.description?.includes('default description'),
      'default description is ignored',
    ).toBeFalsy()
  })

  it('meta and head props are populated based on default rules', async () => {
    const { head, meta } = await composeSfcBlocks('', md, { frontmatterPreprocess, headEnabled: true })
    // Meta props
    const title = meta.find(i => i.property === 'og:title')
    const desc = meta.find(i => i.property === 'og:description')

    expect(head).toBeDefined()
    expect(head.title).toBeDefined()
    expect(head.meta).toBeDefined()

    expect(title).toBeDefined()
    expect(desc).toBeDefined()
    expect(title?.property).toEqual('og:title')
    expect(desc?.property).toEqual('og:description')
  })
})

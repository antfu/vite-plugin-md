import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { resolveOptions } from '../src/options'
import { composeSfcBlocks } from '../src/pipeline'
import type { MetaProperty, Options, ResolvedOptions } from '../src/types'

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

describe('provide bespoke frontmatter processor', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })

  it('inline markdown is used over default properties', async() => {
    const options: Options = { frontmatterPreprocess }
    const { html } = composeSfcBlocks('', md, resolveOptions(options))
    // Positive tests
    expect(
      html.includes('Hello World'),
      'the title attribute is retained over the default \'title\' value',
    ).toBeTruthy()
    expect(
      html.includes('testing is the path to true happiness'),
      'description property is also retained',
    ).toBeTruthy()
    // Negative tests
    expect(
      html.includes('default title'),
      'the title attribute is retained over the default \'title\' value',
    ).toBeFalsy()
    expect(html.includes('default description'), 'default description is ignored').toBeFalsy()

    // Meta props
    expect(html.includes('og:title')).toBeTruthy()
    expect(html.includes('og:description')).toBeTruthy()
  })
})

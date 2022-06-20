import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import { composeFixture } from './utils'
import type { ExcerptFunction } from '~/types'

let content = ''

const firstFourLines = (content: string) => {
  return content
    .split('\n')
    .slice(0, 4)
    .join(' ')
}

const reportOnAvailProps: ExcerptFunction = (_, meta) => {
  return `the properties in frontmatter were: ${Object.keys(meta.frontmatter)}`
}

describe('excerpt', () => {
  beforeAll(async () => {
    content = await readFile('test/fixtures/excerpt-default.md', 'utf-8')
  })

  it('excerpt ignored if option set to false', async () => {
    const sfc = await composeFixture('excerpt-default', { excerpt: false })
    expect(sfc.excerpt).not.toBeDefined()
    expect(
      sfc.md,
      'there is a default separator on page but should be ignored and left on page',
    ).toContain('The default excerpt is assumed to be')
  })

  it('excerpt found in body if option set to true', async () => {
    const sfc = await composeFixture('excerpt-default', { excerpt: true })
    expect(sfc.excerpt).toBeDefined()
    expect(sfc.excerpt).toContain('The default excerpt is assumed to be the text up to')
    expect(
      sfc.md,
      'there is a default separator on page but should be ignored and left on page',
    ).toContain('The default excerpt is assumed to be')
  })

  it('excerpt found in body if option set to true', async () => {
    const sfc = await composeFixture('excerpt-default', { excerpt: true, excerptExtract: true })
    expect(sfc.excerpt).toBeDefined()
    expect(sfc.excerpt).toContain('The default excerpt is assumed to be the text up to')
    expect(sfc.excerpt).not.toContain('Hello')
    expect(
      sfc.md,
      'when excerptExtract is set the excerpt should have been removed!',
    ).not.toContain('The default excerpt is assumed to be')
  })

  it('excerpt with custom separator found when specified', async () => {
    // const sfc = await composeSfcBlocks('excerpt.md', content, options)
    const sfc = await composeFixture('excerpt-custom-sep', {
      excerpt: '<!-- more -->',
    })

    expect(sfc.excerpt).toContain('This is an excerpt')
    expect(sfc.excerpt).not.toContain('Hello')
  })

  it('frontmatter default is overridden by body excerpt', async () => {
    const sfc = await composeFixture('excerpt-default', {
      excerpt: true,
      frontmatterDefaults: {
        excerpt: 'this is the default',
      },
    })

    expect(sfc.excerpt).toContain('The default excerpt is assumed to be the text up to')
    expect(sfc.excerpt).not.toContain('Hello')
  })

  it('excerpt can be defined using a callback function', async () => {
    const firstFourLines = (content: string) => {
      return content
        .split('\n')
        .slice(0, 4)
        .join(' ')
    }

    const { md, excerpt } = await composeFixture('excerpt-friendly', {
      excerpt: firstFourLines,
    })

    expect(excerpt, 'the excerpt should be defined').toBeDefined()
    if (excerpt) {
      expect(excerpt).toContain('custom script will pick it up.')
      expect(excerpt).not.toContain('After that of course we\'re no longer in the excerpt area.')
    }
    // because we kept default for `extractBlocks` prop
    expect(md).toContain('custom script will pick it up.')
    // would always be there
    expect(md).toContain('After that of course we\'re no longer in the excerpt area.')
  })

  it('a callback function for excerpt can not be used alongside a true value for excerptExtract', async () => {
    try {
      await composeFixture('excerpt-friendly', {
        excerpt: firstFourLines,
        excerptExtract: true,
      })
      throw new Error('configuration should have caused error')
    }
    catch (error) {
      expect(error instanceof Error).toBeTruthy()
      if (error instanceof Error)
        expect(error.message).toContain('This is not allowed')
    }
  })

  it('frontmatter defaultValues and overrides are made available to the excerpt callback', async () => {
    const { excerpt } = await composeFixture('excerpt-friendly', {
      excerpt: reportOnAvailProps,
      frontmatterDefaults: {
        foo: 42,
        bar: 33,
      },
      frontmatterOverrides: {
        baz: 'the one and only',
      },
    })

    expect(excerpt).toContain('foo')
    expect(excerpt).toContain('bar')
    expect(excerpt).toContain('baz')

    expect(excerpt).toContain('title')
    expect(excerpt).toContain('description')
  })
})

describe('excerpt snapshots', () => {
  beforeAll(async () => {
    content = await readFile('test/fixtures/excerpt-default.md', 'utf-8')
  })

  it('frontmatter is consistent', async () => {
    const { frontmatter } = await composeSfcBlocks('excerpt-default.md', content, { excerpt: true })
    expect(frontmatter).toMatchSnapshot()
  })

  it('markdown is consistent', async () => {
    const { md } = await composeSfcBlocks('excerpt-default.md', content, { excerpt: true })
    expect(md).toMatchSnapshot()
  })
})

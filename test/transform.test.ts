import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'

let page = ''

describe('transform snapshots', () => {
  beforeAll(async() => {
    page = await readFile('test/fixtures/transform.md', 'utf-8')
  })

  it('frontmatter remains the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.frontmatter).toMatchSnapshot()
  })
  it('meta props remains the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.meta).toMatchSnapshot()
  })
  it('head props remains the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.head).toMatchSnapshot()
  })
  it('html remains the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.html).toMatchSnapshot()
  })
  it('customBlocks remain the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.customBlocks).toMatchSnapshot()
  })
  it('script blocks remain the same', () => {
    const sfc = composeSfcBlocks('transform.md', page)
    expect(sfc.scriptBlock).toMatchSnapshot()
  })
})

/**
 * the key here is that "v-pre" is present otherwise
 * when VueJS tries to convert to the {{ variable }}
 * into a value
 */
const ESCAPED_CODE_TAG = (lang: 'html' | 'ts') => `<code class="language-${lang}" v-pre>`
const UN_ESCAPED_CODE_TAG = (lang: 'html' | 'ts') => `<code class="language-${lang}">`

describe('transform', () => {
  beforeAll(async() => {
    page = await readFile('test/fixtures/transform.md', 'utf-8')
  })

  it('escapeCodeTagInterpolation behavior exhibited when option set to true (default)', () => {
    const sfc = composeSfcBlocks('transform.md', page)

    expect(sfc.html.includes(ESCAPED_CODE_TAG('html'))).toBeTruthy()
    expect(
      sfc.html.includes(UN_ESCAPED_CODE_TAG('ts')),
      `when "escapeCodeTagInterpolation" is turned on at the option level, but the "!" is used as a prefix to the language it should reverse the behavior but did not [ isEscaped: ${sfc.html.includes(ESCAPED_CODE_TAG('ts'))} ]\n${sfc.html}`,
    ).toBeTruthy()
  })

  it('escapeCodeTagInterpolation behavior removed when set to false', () => {
    const sfc = composeSfcBlocks('transform.md', page, { escapeCodeTagInterpolation: false })
    expect(sfc.html.includes(UN_ESCAPED_CODE_TAG('html'))).toBeTruthy()
    expect(
      sfc.html.includes(ESCAPED_CODE_TAG('ts')),
      `when "escapeCodeTagInterpolation" is turned OFF at the option level, using the "!" as a prefix should reverse the behavior but did not [ isUnescaped: ${sfc.html.includes(UN_ESCAPED_CODE_TAG('ts'))} ]\n${sfc.html}`,
    ).toBeTruthy()
  })
})

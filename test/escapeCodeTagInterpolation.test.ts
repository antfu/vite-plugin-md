import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('escapeCodeTagInterpolation()', () => {
  it('default is to turn on tag interpolation', async() => {
    const sfc = await composeFixture('escape-on.md')

    expect(sfc.html).toContain('language-vue')
    expect(sfc.html, `\nthe "!" should not be part of the HTML:\n${sfc.html}\n`).not.toContain('language-!vue')
  })

  it('explicitly configuring tag interpolation to "true" works too', async() => {
    const sfc = await composeFixture('escape-on.md', { escapeCodeTagInterpolation: true })

    expect(sfc.html).toContain('language-vue')
    expect(sfc.html).not.toContain('language-!vue')
  })

  it('configuring tag interpolation to "false" works in reverse', async() => {
    const sfc = await composeFixture('escape-off.md', { escapeCodeTagInterpolation: true })

    expect(sfc.html).toContain('language-vue')
    expect(sfc.html).not.toContain('language-!vue')
  })
})

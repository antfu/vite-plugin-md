import { describe, expect, it } from 'vitest'
import { getAttribute, select, toHtml } from 'happy-wrapper'
import { code } from '../src'
import { composeFixture, importFixture } from './utils'

describe('escapeCodeTagInterpolation()', () => {
  it('default is to turn on tag interpolation', async () => {
    const sfc = await composeFixture('escape-on.md')

    const sel = select(sfc.html)
    const pre = sel.findAll('pre')
    const getVPre = getAttribute('v-pre')

    expect(sfc.html).toContain('language-vue')
    expect(
      sfc.html,
      `\nthe "!" should not be part of the HTML:\n${sfc.html}\n`,
    ).not.toContain('language-!vue')

    expect(getVPre(pre[0])).toBeTruthy()
    expect(getVPre(pre[1])).toBeFalsy()
  })

  it('explicitly configuring tag interpolation to "true" works too', async () => {
    const sfc = await composeFixture('escape-on.md', { escapeCodeTagInterpolation: true })
    const sel = select(sfc.html)
    const pre = sel.findAll('pre')
    const getVPre = getAttribute('v-pre')

    expect(sfc.html).toContain('language-vue')
    expect(sfc.html).not.toContain('language-!vue')

    expect(getVPre(pre[0])).toBeTruthy()
    expect(getVPre(pre[1])).toBeFalsy()
  })

  it('configuring tag interpolation to "false" works in reverse', async () => {
    const sfc = await composeFixture('escape-off.md', { escapeCodeTagInterpolation: false })
    const sel = select(sfc.html)
    const pre = sel.findAll('pre')
    const getVPre = getAttribute('v-pre')

    expect(sfc.html).toContain('language-vue')
    expect(sfc.html).not.toContain('language-!vue')

    expect(getVPre(pre[0])).toBeTruthy()
    expect(getVPre(pre[1])).toBeFalsy()
  })

  it('tag interpolation works the same when using code() builder', async () => {
    const sfc = await composeFixture('escape-on.md', { builders: [code()] })
    const sel = select(sfc.html)
    const pre = sel.findAll('pre')
    const getVPre = getAttribute('v-pre')
    const getDataLang = getAttribute('data-lang')

    // vue doesn't exist as a type but is aliased to handlebars
    expect(sfc.html).toContain('language-handlebars')
    expect(sfc.html).not.toContain('language-!handlebars')

    expect(
      getVPre(pre[0]), `The pre tag should have had a v-pre directive: ${pre[0]}`,
    ).toBeTruthy()
    expect(
      getVPre(pre[1]), `The pre tag should NOT have had a v-pre directive: ${pre[1]}`,
    ).toBeFalsy()

    expect(getDataLang(pre[0]), `data-lang should have been vue: ${getDataLang(pre[0])}`).toBe('vue')
    expect(getDataLang(pre[1]), `data-lang should have been vue: ${getDataLang(pre[0])}`).toBe('vue')
  })
})

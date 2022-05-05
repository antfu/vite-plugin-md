import { beforeAll, describe, expect, it } from 'vitest'
import { getAttribute, select } from 'happy-wrapper'
import type { Pipeline } from '../src/types'
import { composeFixture } from './utils'

let sfc: Pipeline<'closeout'>

describe('transform snapshots', () => {
  beforeAll(async () => {
    sfc = await composeFixture('transform.md')
  })

  it('frontmatter remains the same', async () => {
    expect(sfc.frontmatter).toMatchSnapshot()
  })
  it('meta props remains the same', async () => {
    expect(sfc.meta).toMatchSnapshot()
  })
  it('head props remains the same', async () => {
    expect(sfc.head).toMatchSnapshot()
  })
  it('html remains the same', async () => {
    expect(sfc.html).toMatchSnapshot()
  })
  it('customBlocks remain the same', async () => {
    expect(sfc.customBlocks).toMatchSnapshot()
  })
  it('script blocks remain the same', async () => {
    expect(sfc.scriptBlock).toMatchSnapshot()
  })
})

describe('transform', () => {
  it('escapeCodeTagInterpolation behavior exhibited when option set to true (default)', async () => {
    const sfc = await composeFixture('transform.md', { escapeCodeTagInterpolation: true })
    const pre = select(sfc.html).findAll('pre')
    const getVPre = getAttribute('v-pre')

    expect(getVPre(pre[0])).toBeTruthy()
    expect(getVPre(pre[1])).toBeFalsy()
  })

  it('escapeCodeTagInterpolation behavior removed when set to false', async () => {
    const sfc = await composeFixture('transform.md', { escapeCodeTagInterpolation: false })
    const pre = select(sfc.html).findAll('pre')
    const getVPre = getAttribute('v-pre')

    expect(getVPre(pre[0])).toBeFalsy()
    expect(getVPre(pre[1])).toBeTruthy()
  })
})

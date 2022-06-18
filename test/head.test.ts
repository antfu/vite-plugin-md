import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

const titleDefined = /const title = /
const descDefined = /const description = /
const metaDefined = /const meta = /
const importFound = /import { useHead }/
const useHeadFound = /useHead\(head\)/

describe('using HEAD variables', () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })

  it('with default settings, head variable defined but no references to useHead', async () => {
    const { scriptSetup } = await composeSfcBlocks('wrapper.md', md)
    expect(titleDefined.test(scriptSetup)).toBeTruthy()
    expect(descDefined.test(scriptSetup)).toBeTruthy()
    expect(metaDefined.test(scriptSetup)).toBeFalsy()
    expect(importFound.test(scriptSetup)).toBeFalsy()
    expect(useHeadFound.test(scriptSetup)).toBeFalsy()
  })

  it('when headEnabled property is set to `false`, behavior is same as the default', async () => {
    const { scriptSetup } = await composeSfcBlocks('wrapper.md', md, { headEnabled: false })
    expect(titleDefined.test(scriptSetup)).toBeTruthy()
    expect(descDefined.test(scriptSetup)).toBeTruthy()
    expect(metaDefined.test(scriptSetup)).toBeFalsy()
    expect(importFound.test(scriptSetup)).toBeFalsy()
    expect(useHeadFound.test(scriptSetup)).toBeFalsy()
    expect(scriptSetup).toMatchSnapshot()
  })

  it('when the headEnabled property is set to `true`, all interaction with useHead is enabled', async () => {
    const { scriptSetup } = await composeSfcBlocks('wrapper.md', md, { headEnabled: true })
    expect(titleDefined.test(scriptSetup)).toBeTruthy()
    expect(descDefined.test(scriptSetup)).toBeTruthy()
    expect(metaDefined.test(scriptSetup)).toBeTruthy()
    expect(importFound.test(scriptSetup)).toBeTruthy()
    expect(useHeadFound.test(scriptSetup)).toBeTruthy()
    expect(scriptSetup).toMatchSnapshot()
  })
})

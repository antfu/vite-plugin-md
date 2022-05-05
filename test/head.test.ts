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
    const { scriptBlock } = await composeSfcBlocks('wrapper.md', md)
    expect(titleDefined.test(scriptBlock)).toBeTruthy()
    expect(descDefined.test(scriptBlock)).toBeTruthy()
    expect(metaDefined.test(scriptBlock)).toBeFalsy()
    expect(importFound.test(scriptBlock)).toBeFalsy()
    expect(useHeadFound.test(scriptBlock)).toBeFalsy()
  })

  it('when headEnabled property is set to `false`, behavior is same as the default', async () => {
    const { scriptBlock } = await composeSfcBlocks('wrapper.md', md, { headEnabled: false })
    expect(titleDefined.test(scriptBlock)).toBeTruthy()
    expect(descDefined.test(scriptBlock)).toBeTruthy()
    expect(metaDefined.test(scriptBlock)).toBeFalsy()
    expect(importFound.test(scriptBlock)).toBeFalsy()
    expect(useHeadFound.test(scriptBlock)).toBeFalsy()
    expect(scriptBlock).toMatchSnapshot()
  })

  it('when the headEnabled property is set to `true`, all interaction with useHead is enabled', async () => {
    const { scriptBlock } = await composeSfcBlocks('wrapper.md', md, { headEnabled: true })
    expect(titleDefined.test(scriptBlock)).toBeTruthy()
    expect(descDefined.test(scriptBlock)).toBeTruthy()
    expect(metaDefined.test(scriptBlock)).toBeTruthy()
    expect(importFound.test(scriptBlock)).toBeTruthy()
    expect(useHeadFound.test(scriptBlock)).toBeTruthy()
    expect(scriptBlock).toMatchSnapshot()
  })
})

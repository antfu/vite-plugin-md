import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import { code, link, meta } from '../src/index'
let md = ''

describe('Builder API registration', () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })
  it('registering a single builder works as expected', async () => {
    const sfc = await composeSfcBlocks('simple.md', md, {
      builders: [code()],
    })
    expect(sfc.options.builders).toHaveLength(1)
  })

  it('registering multiple builders works as expected', async () => {
    const sfc = await composeSfcBlocks('simple.md', md, {
      builders: [code(), link(), meta()],
    })
    expect(sfc.options.builders).toHaveLength(3)
  })
})

import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'

let md = ''

describe('Sourcemap generation', () => {
  beforeAll(async() => {
    md = await readFile('test/fixtures/simple.md', 'utf-8')
  })
  it('sourcemap info is available after parsing', () => {
    const { map } = composeSfcBlocks('test/fixtures/simple.md', md)
    expect(map).toBeDefined()
    expect(map).toMatchSnapshot()
  })
})

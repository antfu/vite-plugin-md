import { describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/composeSfcBlocks'
import { composeFixture } from './utils'

describe('sourcemap support', () => {
  it('pipeline with no filename does not produce a map', async () => {
    const { map } = await composeSfcBlocks('', '# Hello World')
    expect(map).toBeUndefined()
  })

  it('pipeline with filename produces sourcemap', async () => {
    const { map } = await composeFixture('simple')

    expect(map).toBeDefined()
    expect(map?.file).toBe('./test/fixtures/simple.md')
    expect(map?.sources).toContain('./test/fixtures/simple.md')
  })
})

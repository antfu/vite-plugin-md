import { describe, expect, it } from 'vitest'
import { code, link, meta } from '../src'
import { composeFixture } from './utils'

describe('the fileName prop is available', () => {
  it('the fileName prop is available on payload', async () => {
    const sfc = await composeFixture('ts-code-block', {
      builders: [code(), link(), meta()],
    })

    expect(sfc.fileName).toContain('ts-code-block')
  })
})

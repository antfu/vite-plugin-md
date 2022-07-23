import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('the fileName prop is available', () => {
  it('the fileName prop is available on payload', async () => {
    const sfc = await composeFixture('ts-code-block', {
      builders: [],
    })

    expect(sfc.fileName).toContain('ts-code-block')
  })
})

import { describe, expect, it } from 'vitest'
import { code, meta } from '../src'
import { composeFixture } from './utils'

describe('usingBuilder() utility on pipeline', () => {
  it('testing for absence of builders', async () => {
    const sfc = await composeFixture('simple')
    expect(sfc.options.usingBuilder('code')).toBeFalsy()
    expect(sfc.options.usingBuilder('link')).toBeFalsy()
    expect(sfc.options.usingBuilder('meta')).toBeFalsy()
  })

  it('testing for single builder', async () => {
    const sfc = await composeFixture('simple', { builders: [code()] })
    expect(sfc.options.usingBuilder('code')).toBeTruthy()
    expect(sfc.options.usingBuilder('link')).toBeFalsy()
    expect(sfc.options.usingBuilder('meta')).toBeFalsy()
  })

  it('testing for multiple builders', async () => {
    const sfc = await composeFixture('simple', { builders: [code(), meta()] })
    expect(sfc.options.usingBuilder('code')).toBeTruthy()
    expect(sfc.options.usingBuilder('link')).toBeFalsy()
    expect(sfc.options.usingBuilder('meta')).toBeTruthy()
  })
})

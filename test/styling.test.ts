import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('test styling options', () => {
  it('default settings produces zero base styling', async () => {
    const { component, options, styleBlocks, customBlocks } = await composeFixture('simple')
    expect(options.style.baseStyle).toBe('none')
    expect(component).not.toContain('md-text-color')
    expect(styleBlocks.length).toBe(0)
    expect(customBlocks.length).toBe(0)
  })

  it('switching to "github" styling brings in base styles', async () => {
    const { component, options, styleBlocks, customBlocks } = await composeFixture('simple', {
      style: { baseStyle: 'github' },
    })
    expect(options.style.baseStyle).toBe('github')
    expect(component).toContain('md-text-color')
    expect(styleBlocks.length).toBe(1)
    expect(customBlocks.length).toBe(0)
  })
})

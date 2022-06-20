import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('hoisted script blocks', () => {
  it('all "script setup" blocks merged into one block with frontmatter defined first', async () => {
    const { scriptSetup } = await composeFixture('hoisted-2', {
      headEnabled: true,
    })

    // ordering
    const imports = scriptSetup.indexOf('import ')
    const title = scriptSetup.indexOf('const title')
    const defineExpose = scriptSetup.indexOf('defineExpose')
    const sayHi = scriptSetup.indexOf('const sayHi')

    // imports should be first
    expect(title).toBeGreaterThan(imports)
    // then the frontmatter props, followed by defineExpose
    expect(defineExpose).toBeGreaterThan(title)
    // finally, non-import user blocks are injected
    expect(sayHi).toBeGreaterThan(defineExpose)
  })

  it('userland script blocks defined as separate blocks and after script setup', async () => {
    const { scriptSetup, scriptBlocks, component } = await composeFixture('hoisted-2')

    expect(scriptSetup).toContain('const sayHi')
    expect(scriptSetup).toContain('const test')

    const script = scriptBlocks.join('\n')

    expect(script).toContain('const sayBye')
    expect(script).toContain('const test1')
    expect(script).toContain('const test2')
    expect(script).not.toContain('const test =')

    const sayHi = component.indexOf('const sayHi')
    const sayBye = component.indexOf('const sayBye')
    expect(sayHi).lessThan(sayBye)
  })
})

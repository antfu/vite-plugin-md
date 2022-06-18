import { select, toHtml } from '@yankeeinlondon/happy-wrapper'
import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('hoisted script blocks', () => {
  it('snapshot of hoisted scripts section remains the same', async () => {
    const { hoistedScripts } = await composeFixture('hoisted-2')
    expect(hoistedScripts).toMatchSnapshot()
  })

  it('snapshot of component section remains the same', async () => {
    const { component } = await composeFixture('hoisted-2')
    expect(component).toMatchSnapshot()
  })

  it('script sections all identified in hoistedScripts array', async () => {
    const { hoistedScripts } = await composeFixture('hoisted-2')

    expect(hoistedScripts).toHaveLength(4)
    expect(hoistedScripts.filter(s => s.includes('setup'))).toHaveLength(2)
  })

  it.only('all "script setup" blocks merged into one block with frontmatter defined first', async () => {
    const { component } = await composeFixture('hoisted-2')
    const scriptSetup = select(component).findAll('script[setup]')
    expect(scriptSetup, 'there should only be ONE scriptSetup block').toHaveLength(1)
    const script = toHtml(scriptSetup[0])

    // ordering
    const imports = script.indexOf('from \'some-other-place\'')
    const defineExposure = script.indexOf('defineExpose')
    const title = script.indexOf('const title')
    const sayHi = script.indexOf('const sayHi')

    // imports should be first
    expect(defineExposure).toBeGreaterThan(imports)
    // then defineExports, then the frontmatter props
    expect(title).toBeGreaterThan(defineExposure)
    // finally, non-import user blocks are injected
    expect(sayHi).toBeGreaterThan(title)
  })

  it('userland script blocks defined as separate blocks and after script setup', async () => {
    const { component } = await composeFixture('hoisted-2')

    const scriptBlocks = select(component).filterAll('script[setup]').findAll('script')

    // we should see two blocks from userland but there is also one created
    // by the library code to export the frontmatter
    expect(scriptBlocks).toHaveLength(3)

    const positions = scriptBlocks.map(b => component.indexOf(toHtml(b)))
    const setupScriptLocation = component.indexOf(
      toHtml(
        select(component)
          .findFirst(
            'script[setup]',
            'No script setup section found in component!',
          ),
      ),
    )
    // all traditional script blocks are declared _after_ the script setup block
    positions.forEach(pos => expect(pos).toBeGreaterThan(setupScriptLocation))
  })
})

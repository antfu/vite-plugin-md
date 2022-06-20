import { describe, expect, it } from 'vitest'
import type { DefineComponent } from 'vue'
// import { ssrRenderStyle } from 'vue/server-renderer'
import type { Frontmatter } from '../../src/types'

describe.skip('converting SFC\'s to Components', () => {
  it.skip('get component via an async import', async () => {
    const sfc = await import('../fixtures/with-slots.md') as {
      default: DefineComponent
      frontmatter: Frontmatter
    }

    expect(sfc.frontmatter.title).toBe('Testing Slots')
    expect(sfc.default.__name).toBe('with-slots')
    expect(sfc.default.props.name).toBeDefined()
    expect(sfc.default.props.name.type).toBeDefined()
  })

  it('use vue\'s server render', async () => {
    // const sfc = await composeFixture('links', {
    //   builders: [
    //     link({ useRouterLinks: false }),
    //   ],
    // })

    // const c = defineComponent({
    //   name: 'SimpleMD',
    //   setup: () => sfc.scriptSetup,
    //   template: sfc.templateBlock,
    //   expose: ['frontmatter'],

    // })
    // console.log(c)

    // console.log('SCRIPT BLOCKS\n', sfc.scriptBlocks)
    // console.log('END SCRIPT BLOCK')

    // const component = createSSRApp({
    //   __name: 'simple.md',
    //   template: sfc.templateBlock,
    //   name: 'simple2.md',
    //   __file: 'test/fixtures/simple.md',
    //   set: ,
    // })

    // const style = ssrRenderStyle(sfc.styleBlocks)
    // console.log('STYLE: ', style, '\nEND STYLE')
    // console.log('COMPONENT\n');

    // const html = await renderToString(c)

    // console.log('HTML\n', html)
  })
})

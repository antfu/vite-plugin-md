import { join } from 'path'
import type { MountingOptions } from '@vue/test-utils'
import { HappyMishap } from '../../src/builders/code/utils'
import type { Options } from '../../src/types'
import { composeFixture } from './composeFixture'

export const mountFixture = async (fixture: string, pluginOptions: Options = {}) => {
  const sfc = await composeFixture(fixture, pluginOptions)
  const file = fixture = join(process.cwd(), 'test/fixtures', fixture.endsWith('.md')
    ? fixture
    : `${fixture}.md`)

  const Component = await import(file)

  return <T extends MountingOptions<any>>(_mountOptions: T = {} as T) => {
    try {
      // const wrapper = mount(Component.default, mountOptions)
      // console.log(`wrapper mounted: ${typeof wrapper}`)

      return {
        frontmatter: Component().frontmatter,
        component: Component().default,
      }
    }
    catch (error) {
      throw new HappyMishap(`Problem mounting "${fixture}" into DOM [${file}]. The markdown of the file was:\n${sfc.md}`, { error, name: 'mountFixture' })
    }
  }
}

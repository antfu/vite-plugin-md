import type { MountingOptions } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { HappyMishap } from '../../src/builders/code/utils'
import type { Options } from '../../src/types'
import { composeFixture } from './composeFixture'

export const mountFixture = async(fixture: string, pluginOptions: Options = {}) => {
  const file = fixture.endsWith('.md')
    ? `./test/fixtures/${fixture}`
    : `./test/fixtures/${fixture}.md`

  const component = await import(file)

  const sfc = await composeFixture(component, pluginOptions)
  return <T extends MountingOptions<any>>(mountOptions: T = {} as T) => {
    try {
      return mount({
        name: fixture.replace('.md', ''),
        props: mountOptions.props || {},
        template: sfc.component,
      }, mountOptions)
    }
    catch (error) {
      throw new HappyMishap(`Problem mounting "${file}" into DOM. The markdown of the file was:\n${sfc.md}`, { error, name: 'mountFixture' })
    }
  }
}

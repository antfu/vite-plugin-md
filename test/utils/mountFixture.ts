import type { MountingOptions } from '@vue/test-utils'
import { mount } from '@vue/test-utils'

export const mountFixture = async(fixture: string) => {
  const file = fixture.endsWith('.md')
    ? `./test/fixtures/${fixture}`
    : `./test/fixtures/${fixture}.md`

  const component = await import(file)

  return <T extends MountingOptions<any>>(mountOptions: T = {} as T) => {
    return mount(component, mountOptions)
  }
}

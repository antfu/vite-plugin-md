import { readFile } from 'fs/promises'
import { resolveOptions } from '../../src/options'
import { createMarkdown } from '../../src/markdown'
import type { Options } from '../../src/types'

export const composeFixture = async(fixture: string, options: Options = {}) => {
  const markdownToVue = createMarkdown(resolveOptions(options))

  fixture = fixture.endsWith('.md')
    ? fixture
    : `${fixture}.md`

  const md = await readFile(`test/fixtures/${fixture}`, 'utf-8')

  return markdownToVue(fixture, md)
}

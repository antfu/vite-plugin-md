import { composeSfcBlocks } from '../../src/pipeline'
import type { Options } from '../../src/types'
import { getFixture } from './getFixture'

/**
 * Test util to help pickup a Markdown file from fixtures folder and have it parsed
 * using `composeSfcBlocks()`
 */
export const composeFixture = async (fixture: string, options: Options = {}) => {
  fixture = fixture.endsWith('.md')
    ? `./test/fixtures/${fixture}`
    : `./test/fixtures/${fixture}.md`

  const md = await getFixture(fixture)

  return composeSfcBlocks(
    fixture,
    md,
    options,
  )
}

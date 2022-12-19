import { composeSfcBlocks } from '../../src'
import type { Options, ToBuilder } from '../../src/types'
import { getFixture } from './getFixture'

/**
 * Test util to help pickup a Markdown file from fixtures folder and have it parsed
 * using `composeSfcBlocks()`
 */
export const composeFixture = async <
  O extends Partial<Options<readonly any[] | readonly[]>> = Partial<Options<readonly []>>,
>(
  fixture: string,
  options?: O,
) => {
  const o = (
    options
      ? options.builders
        ? options
        : {
            ...options,
            builders: [],
          }
      : options
  ) as O['builders'] extends undefined
    ? Partial<Options<readonly []>>
    : Partial<Options<ToBuilder<O['builders']>>>

  fixture = fixture.endsWith('.md')
    ? `./test/fixtures/${fixture}`
    : `./test/fixtures/${fixture}.md`

  const md = await getFixture(fixture)

  return composeSfcBlocks(
    fixture,
    md,
    o,
  )
}

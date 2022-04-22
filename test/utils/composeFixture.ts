import { join } from 'path'
import { composeSfcBlocks } from '../../src/pipeline'
import type { Options } from '../../src/types'
import { getFixture } from './getFixture'

export const composeFixture = async(fixture: string, options: Options = {}) => {
  fixture = fixture.endsWith('.md')
    ? fixture
    : `${fixture}.md`

  console.log({ fixture })

  return composeSfcBlocks(
    fixture,
    (await getFixture(fixture)),
    options,
  )
}

import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import { code } from '../src/index'

async function getFixture(file: string): Promise<string> {
  const content = await readFile(`test/fixtures/${file}`, 'utf-8')
  return content
}

describe('code() builder', () => {
  it.only('valid language choice is rendered', async() => {
    const { templateBlock } = composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('multi-code-block.md'),
      { builders: [code()] },
    )
    expect(templateBlock).toMatchSnapshot()
    expect(templateBlock.includes('language-ts')).toBeTruthy()
    expect(
      templateBlock.includes('language-bash'),
      'while "bash" is the default language, it should not be falling back to that with a valid language detected',
    ).toBeFalsy()
  })
  it('"unknown language" fallback is used when language stated but not matched', async() => {
    const { templateBlock } = composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('unknown-code-block.md'),
      { builders: [code()] },
    )

    const langLine = templateBlock.split('\n').find(i => i.includes('language-'))
    expect(templateBlock.includes('language-bash'), `default fallback is "bash" but language line was:\n${langLine}`).toBeTruthy()
    expect(templateBlock.includes('language-xxx')).toBeFalsy()
  })
  it('line numbers are displayed when set', async() => {
    const { templateBlock } = composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('ts-code-block.md'),
      { builders: [code({ lineNumbers: true })] },
    )
    expect(templateBlock).toMatchSnapshot()
  })
  it.todo('line highlighting of single line works')
  it.todo('line highlighting of line range works')
})

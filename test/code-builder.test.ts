import { readFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { composeSfcBlocks } from '../src/pipeline'
import { code } from '../src/index'
import { queryHtml } from '../src/builders/code/utils'

const window = new Window()
const document = window.document

async function getFixture(file: string): Promise<string> {
  const content = await readFile(`test/fixtures/${file}`, 'utf-8')
  return content
}

describe('code() builder using Prism (incl generalized tests)', () => {
  it('valid language choice is rendered', async() => {
    const { templateBlock } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('multi-code-block.md'),
      { builders: [code()] },
    )

    expect(templateBlock).toMatchSnapshot()
    // note: "ts" is in MD but alias converts to "typescript"
    expect(templateBlock.includes('language-typescript')).toBeTruthy()
    expect(
      templateBlock.includes('language-bash'),
      'while "bash" is the default language, it should not be falling back to that with a valid language detected',
    ).toBeFalsy()
  })
  it('"unknown language" fallback is used when language stated but not matched', async() => {
    const { templateBlock } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('unknown-code-block.md'),
      { builders: [code()] },
    )

    const langLine = templateBlock.split('\n').find(i => i.includes('language-'))
    expect(templateBlock.includes('language-bash'), `default fallback is "bash" but language line was:\n${langLine}`).toBeTruthy()
    expect(templateBlock.includes('language-xxx')).toBeFalsy()
  })
  it('the correct fallback is used when NO language is found', async() => {
    const { templateBlock } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('no-language.md'),
      {
        builders: [code({
          defaultLanguageForUnspecified: 'md',
        })],
      },
    )

    const langLine = templateBlock.split('\n').find(i => i.includes('language-markdown'))
    expect(templateBlock.includes('language-bash'), `when no language is stated we configured to have it converted to 'md' but we got:\n${langLine}`).toBeTruthy()
  })
  it.only('line numbers are displayed when set', async() => {
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('ts-code-block.md'),
      { builders: [code({ lineNumbers: true })] },
    )
    console.log(html)

    const dom = queryHtml(html)

    const lines = dom.all('.line')
    const codeCols = dom.all('.col-code')
    const lineNumCols = dom.all('.col-line-number')
    const blockLevel = dom.all('.line-numbers-mode')
    const tbl = dom.all('table')

    expect(lines.length, 'there should be five lines of code in the block').toBe(5)
    expect(codeCols.length, 'code cols selectors should be same as lines of code').toBe(5)
    expect(lineNumCols.length, 'col-line-number selectors should be same as lines of code').toBe(5)
    expect(blockLevel.length, '.line-numbers-mode should be found once').toBe(1)
    expect(tbl.length, 'the wrapping table for cols/line-numbers should be found').toBe(1)

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })

  it('line highlighting of single line works using vuepress/vitepress syntax', async() => {
    // Vite/Vuepress support adding something like {3} to highlight line 3
    // any line which is highlighted is done so by adding the `highlight` class to a line's span element
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('highlight-one-line.md'),
      { builders: [code()] },
    )

    const dom = queryHtml(html)
    const lines = dom.all('.line')
    const highlighted = dom.all('.highlight')

    expect(lines.length).toBe(5)
    expect(highlighted.length).toBe(1)

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })

  it('line highlighting of line range works using vuepress/vitepress syntax', async() => {
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('highlight-multi-line.md'),
      { builders: [code({ lineNumbers: true })] },
    )

    // console.log(html)

    document.body.innerHTML = html
    const highlighted = document.querySelectorAll('.highlight')

    expect(highlighted.length, 'there should be three lines highlighted').toBe(3)
    highlighted.map(l =>
      expect(l.classList, 'a highlighted line should also contain a "line" class').toContain('line'),
    )

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })
  it.todo('line highlighting of single line works using object syntax', async() => {
    //
  })
  it.todo('line highlighting of line range works using object syntax', async() => {
    //
  })

  it.todo('class attribute passed in via object syntax is applied to code block')
  it.todo('style attribute passed in via object syntax is applied to code block')

  it.todo('code content loaded from file using <<< syntax')
  it.todo('highlighting code lines from imported code')
  it.todo('highlighting code symbol\'s block from imported code')
})

describe('code() builder using Shiki', () => {
  it.todo('switching to Shiki on basic template works as expected')
  it.todo('Shiki works with light/dark mode')
  it.todo('"unknown language" fallback is used when language stated but not matched', async() => {
  })
})

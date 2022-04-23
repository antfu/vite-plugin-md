import { describe, expect, it } from 'vitest'
import { composeSfcBlocks } from '../src/pipeline'
import { code } from '../src/index'
import { getAttribute, getClassList, select } from '../src/builders/code/utils'
import { getFixture } from './utils'

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
  it('line numbers are displayed when set', async() => {
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('ts-code-block.md'),
      { builders: [code({ lineNumbers: true })] },
    )

    const dom = select(html)

    const lines = dom.findAll('.line')

    const lineNumCols = dom.findAll('.line-number')
    const lineNumberMode = dom.findAll('.line-numbers-mode')
    const linesWrapper = dom.findAll('.line-numbers-wrapper')
    const block = dom.findAll('.code-block')

    expect(lines.length).toBe(5)
    expect(lineNumCols.length, 'each line should have a .line-numbers-mode').toBe(5)
    expect(lineNumberMode.length, '.line-numbers-mode should be found once').toBe(1)
    expect(linesWrapper.length).toBe(1)
    expect(block.length, 'the wrapping table for cols/line-numbers should be found').toBe(1)

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })

  it('line highlighting of single line works using vuepress/vitepress syntax', async() => {
    // Vite/Vuepress support adding something like {3} to highlight line 3
    // any line which is highlighted is done so by adding the `highlight` class to a line's span element
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('highlight-one-line.md'),
      { builders: [code({ lineNumbers: true })] },
    )

    const dom = select(html)
    const lines = dom.findAll('.line')
    const linesWrapper = dom.findAll('.line-numbers-wrapper')
    const highlighted = dom.findAll('.highlight')

    expect(lines.length).toBe(5)
    expect(linesWrapper.length).toBe(1)
    expect(highlighted.length, 'both code and line number received a highlight class').toBe(2)

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })

  it('line highlighting of line range works using vuepress/vitepress syntax', async() => {
    const { templateBlock, html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      await getFixture('highlight-multi-line.md'),
      { builders: [code()] },
    )

    const highlighted = select(html).findAll('.highlight')

    expect(highlighted.length, 'there should be three lines highlighted').toBe(3)
    highlighted.map(el =>
      expect(getClassList(el), 'a highlighted line should also contain a "line" class').toContain('line'),
    )

    // snapshot
    expect(templateBlock).toMatchSnapshot()
  })

  it('line highlighting of multiple blocks using vuepress/vitepress syntax', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/highlight-multi-block',
      // {1-2, 5}
      await getFixture('highlight-multi-block.md'),
      { builders: [code()] },
    )

    const highlighted = select(html).findAll('.highlight')
    const line1 = select(html).findFirst('.line-1')
    const line2 = select(html).findFirst('.line-2')
    const line3 = select(html).findFirst('.line-3')
    const line4 = select(html).findFirst('.line-4')
    const line5 = select(html).findFirst('.line-5')

    expect(highlighted.length, 'there should be three lines highlighted').toBe(3)
    expect(getClassList(line1)).toContain('highlight')
    expect(getClassList(line2)).toContain('highlight')
    expect(getClassList(line3)).not.toContain('highlight')
    expect(getClassList(line4)).not.toContain('highlight')
    expect(getClassList(line5)).toContain('highlight')
  })

  it('line highlighting of multiple blocks using CSV', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/highlight-multi-block',
      // {1-2, 5}
      (await getFixture('highlight-multi-block.md')).replace('{1-2, 5}', 'highlight = ["1-2", 5]'),
      { builders: [code()] },
    )

    const highlighted = select(html).findAll('.highlight')
    const line1 = select(html).findFirst('.line-1')
    const line2 = select(html).findFirst('.line-2')
    const line3 = select(html).findFirst('.line-3')
    const line4 = select(html).findFirst('.line-4')
    const line5 = select(html).findFirst('.line-5')

    expect(highlighted.length, 'there should be three lines highlighted').toBe(3)
    expect(getClassList(line1)).toContain('highlight')
    expect(getClassList(line2)).toContain('highlight')
    expect(getClassList(line3)).not.toContain('highlight')
    expect(getClassList(line4)).not.toContain('highlight')
    expect(getClassList(line5)).toContain('highlight')
  })

  it('line highlighting of single line works using object syntax', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      (await getFixture('highlight-one-line.md')).replace('{4}', '{ "highlight": [4] }'),
      { builders: [code()] },
    )

    const highlighted = select(html).findAll('.highlight')
    expect(highlighted).toHaveLength(1)
    expect(getClassList(highlighted[0])).toContain('line')
  })
  it('line highlighting of line range works using object syntax', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      (await getFixture('highlight-one-line.md')).replace('{4}', '{ "highlight": [2,3] }'),
      { builders: [code()] },
    )

    const highlighted = select(html).findAll('.highlight')
    expect(highlighted, 'explict array elements are highlighted').toHaveLength(2)
    highlighted.forEach(el => expect(getClassList(el)).toContain('line'))

    const { html: html2 } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      (await getFixture('highlight-one-line.md')).replace('{4}', '{ "highlight": ["2-3"] }'),
      { builders: [code()] },
    )

    const highlighted2 = select(html2).findAll('.highlight')
    expect(highlighted2, 'array syntax is interpreted correctly').toHaveLength(2)
    highlighted2.forEach(el => expect(getClassList(el)).toContain('line'))
  })

  it('class attribute passed in via object syntax is applied to code block', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      (await getFixture('stylish.md')),
      { builders: [code()] },
    )

    const pre = select(html).findFirst('pre')
    expect(pre).not.toBeNull()
    expect(getClassList(pre)).toContain('classy')
  })
  it('style attribute passed in via object syntax is applied to code block', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/ts-code-block.md',
      (await getFixture('stylish.md')),
      { builders: [code()] },
    )

    const pre = select(html).findFirst('pre')
    expect(getAttribute('style')(pre)).toBe('text-color: green')
  })

  it('code content loaded from file using <<< syntax', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/external-reference.md',
      (await getFixture('external-reference.md')),
      { builders: [code()] },
    )

    const sel = select(html)
    expect(getClassList(sel.findFirst('.code-block'))).toContain('external-ref')
    expect(sel.findFirst('.comment')?.textContent).toContain('this is one impressive function')
  })
  it('code content loaded from file using object notation', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/external-reference-obj.md',
      (await getFixture('external-reference-obj.md')),
      { builders: [code()] },
    )

    const sel = select(html)
    expect(getClassList(sel.findFirst('.code-block'))).toContain('external-ref')
    expect(sel.findFirst('.comment')?.textContent).toContain('this is one impressive function')
  })

  it('code content loaded from file using CSV notation', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/external-reference-obj.md',
      (await getFixture('external-reference-csv.md')),
      { builders: [code()] },
    )

    const sel = select(html)
    expect(getClassList(sel.findFirst('.code-block'))).toContain('external-ref')
    expect(sel.findFirst('.comment')?.textContent).toContain('this is one impressive function')
  })

  it('highlighting imported code, while also using inline code', async() => {
    const { html } = await composeSfcBlocks(
      'test/fixtures/external-reference-obj.md',
      // highlight=2
      (await getFixture('external-reference-inline.md')),
      { builders: [code()] },
    )

    const sel = select(html)
    expect(getClassList(sel.findFirst('.code-block'))).toContain('external-ref')
    expect(getClassList(sel.findFirst('.code-block'))).toContain('with-inline-content')
    // the first comment should now come from the inline comment
    expect(sel.findFirst('.comment')?.textContent).not.toContain('this is one impressive function')
    expect(sel.findFirst('.comment')?.textContent).toContain('the code below was brought in from an external file')
  })

  // TODO: add this when symbol highlighting is ready
  it.todo('highlighting code symbol\'s block from imported code')

  it.only('adding a heading and footer in props creates proper HTML output', async() => {
    const { html, component } = await composeSfcBlocks(
      'test/fixtures/external-reference-obj.md',
      (await getFixture('external-reference-inline.md')),
      { builders: [code()] },
    )
    const sel = select(html)
    console.log(component)

    const heading = sel.findFirst('.heading')
    expect(heading).not.toBeNull()
    expect(
      heading?.textContent,
      `\ntext content of header was incorrect, value: "${heading?.textContent}"\n`,
    ).toBe('Using CSV format')
    const footer = sel.findFirst('.footer')
    expect(footer).not.toBeNull()
    expect(footer?.textContent).toBe('to be or not to be')
  })
})

describe('code() builder using Shiki', () => {
  it.todo('switching to Shiki on basic template works as expected')
  it.todo('Shiki works with light/dark mode')
  it.todo('"unknown language" fallback is used when language stated but not matched', async() => {
  })
})

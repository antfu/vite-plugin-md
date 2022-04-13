import { pipe } from 'fp-ts/lib/function'
import { describe, expect, it } from 'vitest'
import {
  addClassToNode,
  getClasslistFromNode,
  getCodeLines,
  getHtmlFromCodeLines,
  getHtmlFromNode,
  htmlToDocFragment,
  htmlToDocument,
  removeClassFromDoc,
  safeString,
  wrapChildNodes,
  wrapWithText,
} from '../src/builders/code/utils/happyDom'

const tokenizedCode = `
<span class="line"><span class="token keyword">type</span> <span class="token class-name">Valid</span> <span class="token operator">=</span> <span class="token string">'foo'</span> <span class="token operator">|</span> <span class="token string">'bar'</span> <span class="token operator">|</span> <span class="token string">'baz'</span></span>
<span class="line"><span class="token keyword">const</span> testVariable<span class="token operator">:</span> Valid <span class="token operator">=</span> <span class="token string">'foo'</span></span>
<span class="line"><span class="token keyword">function</span> <span class="token function">myFunc</span><span class="token punctuation">(</span>name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">return</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">hello </span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span>name<span class="token interpolation-punctuation punctuation">}</span></span><span class="token template-punctuation string">\`</span></span></span>
<span class="line"><span class="token punctuation">}</span></span>
`

const bareCode = `
type Valid = 'foo' | 'bar' | 'baz'
const testVariable: Valid = 'foo'
function myFunc(name: string) {
  return \`hello \${name}\`
}
`

describe('HappyDom\'s can be idempotent', () => {
  it('HTML remains unchanged when passed into and out of Document', () => {
    const html = htmlToDocument(tokenizedCode)
    const html2 = htmlToDocument(bareCode)

    expect(html.body.innerHTML).toEqual(tokenizedCode)
    expect(html2.body.innerHTML).toEqual(bareCode)

    expect(getHtmlFromNode(htmlToDocument(bareCode))).toEqual(bareCode)
  })

  it('HTML remains unchanged when passed into and out of DocumentFragment', () => {
    const html1 = htmlToDocFragment(tokenizedCode)
    const html2 = htmlToDocFragment(bareCode)
    const html3 = '\n\t<span>foobar</span>\n'
    const frag3 = htmlToDocFragment(html3)

    expect(html1.firstElementChild?.innerHTML).toEqual(tokenizedCode)
    expect(html2.firstElementChild?.innerHTML).toEqual(bareCode)
    expect(getHtmlFromNode(frag3)).toEqual(html3)

    expect(getHtmlFromNode(htmlToDocFragment(bareCode))).toEqual(bareCode)
  })

  it('code block split by lines and parsed can be reassembled without change', () => {
    const lines = getCodeLines(tokenizedCode)
    const code = getHtmlFromCodeLines(lines)

    expect(tokenizedCode).toBe(code)
  })

  it('wrapWithText() utility able to wrap one or more fragments with html before and after', () => {
    const html1 = '<div>foo</div>'
    const html2 = 'hello world'
    const html3 = 'hello <span>world</span>'

    const frag1 = htmlToDocFragment(html1)
    const frag2 = htmlToDocFragment(html2)
    const frag3 = htmlToDocFragment(html3)

    const wrap1 = wrapWithText('before', 'after')(frag1)
    const wrap2 = wrapWithText('before', 'after')(frag2)
    const wrap3 = wrapWithText('before', 'after')(frag3)

    const wrap1alt = wrapWithText('<div class="wrap">', '</div>')(frag1)
    const wrap2alt = wrapWithText('<div class="wrap">', '</div>')(frag2)
    const wrap3alt = wrapWithText('<div class="wrap">', '</div>')(frag3)

    // #region standard
    expect(
      getHtmlFromNode(wrap1).startsWith('before'),
      `wrap1 should start with "before": ${getHtmlFromNode(wrap1)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap1).endsWith('after'),
      `wrap1 should end with with "after": ${getHtmlFromNode(wrap1)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap1)).toContain(html1)

    expect(
      getHtmlFromNode(wrap2).startsWith('before'),
      `wrap2 should start with "before": ${getHtmlFromNode(wrap2)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap2).endsWith('after'),
      `wrap1 should end with with "after": ${getHtmlFromNode(wrap2)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap2)).toContain(html2)

    expect(
      getHtmlFromNode(wrap3).startsWith('before'),
      `wrap3 should start with "before": ${getHtmlFromNode(wrap3)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap3).endsWith('after'),
      `wrap1 should end with with "after": ${getHtmlFromNode(wrap3)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap3)).toContain(html3)
    // #endregion

    // #region alt
    expect(
      getHtmlFromNode(wrap1alt).startsWith('<div class="wrap">'),
      `wrap1alt should start with DIV wrapper: ${getHtmlFromNode(wrap1alt)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap1alt).endsWith('</div>'),
      `wrap1alt should end with with DIV wrapper: ${getHtmlFromNode(wrap1alt)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap1alt)).toContain(html1)

    expect(
      getHtmlFromNode(wrap2alt).startsWith('<div class="wrap">'),
      `wrap2alt should start with DIV wrapper: ${getHtmlFromNode(wrap2alt)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap2alt).endsWith('</div>'),
      `wrap2alt should end with with DIV wrapper: ${getHtmlFromNode(wrap2alt)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap2alt)).toContain(html2)

    expect(
      getHtmlFromNode(wrap3alt).startsWith('<div class="wrap">'),
      `wrap3alt should start with DIV wrapper: ${getHtmlFromNode(wrap3alt)}`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(wrap3alt).endsWith('</div>'),
      `wrap3alt should end with with DIV wrapper: ${getHtmlFromNode(wrap3alt)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(wrap3alt)).toContain(html3)
    // #endregion alt

    // #region special
    const special1 = wrapWithText('\tbefore', 'after\n')(frag1)
    const special2 = wrapWithText('\tbefore', 'after\n')(frag2)
    const special3 = wrapWithText('\tbefore', 'after\n', 1)(frag1)
    const special4 = wrapWithText('\tbefore', 'after\n', 1)(frag2)

    const sHtml1 = getHtmlFromNode(special1)
    const sHtml2 = getHtmlFromNode(special2)
    const sHtml3 = getHtmlFromNode(special3)
    const sHtml4 = getHtmlFromNode(special4)

    expect(
      getHtmlFromNode(special1).startsWith('\tbefore'),
      `special1 should start with "\tbefore" but actual was:\n"${sHtml1}"`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(special1).endsWith('after\n'),
      `special1 should have ended with a '\n': ${getHtmlFromNode(special1).slice(-1)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(special1)).toContain(html1)
    // 2
    expect(
      getHtmlFromNode(special2).startsWith('\tbefore'),
      `special2 should start with "\tbefore" but actual was:\n"${sHtml2}"`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(special2).endsWith('after\n'),
      `special2 should have ended with a '\n': ${getHtmlFromNode(special2).slice(-1)}`,
    ).toBeTruthy()
    expect(getHtmlFromNode(special2)).toContain(html2)
    // 3
    expect(
      getHtmlFromNode(special3).startsWith('\t\tbefore'),
      `special3 should start with "\\t\\tbefore" but actual was:\n"${sHtml3}"`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(special3).endsWith('after\n'),
      `special3 should have ended with a '\\n': "${getHtmlFromNode(special3)}"`,
    ).toBeTruthy()
    expect(getHtmlFromNode(special3)).toContain(html1)
    // 4
    expect(
      getHtmlFromNode(special4).startsWith('\t\tbefore'),
      `special4 should start with "\\t\\tbefore" but actual was:\n"${sHtml4}"`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(special4).endsWith('after\n'),
      `special4 should have ended with a '\\n': "${getHtmlFromNode(special4)}"`,
    ).toBeTruthy()
    expect(getHtmlFromNode(special4)).toContain(html2)
    // 5
    const html5 = '\n\tHello World\n'
    const frag5 = htmlToDocFragment(html5)
    // note: indentation of 2 will add `\t\t` to beginning of "before"
    const special5 = wrapWithText('before', 'after\n', 2)(frag5)
    expect(
      getHtmlFromNode(special5).startsWith('\n\t\t\tbefore'),
      `special5 should start with "\\n\\t\\t\\tbefore" but actual was:\n"${html5}"`,
    ).toBeTruthy()
    expect(
      getHtmlFromNode(special5).endsWith('after\n\n'),
      `special5 should have ended with a '\\n\\n': "${getHtmlFromNode(special5)}"`,
    ).toBeTruthy()
    expect(getHtmlFromNode(special5), 'special5 contains original html').toContain(html5.trim())

    // #endregion special
  })

  it('HappyDom\'s conversion to lines remains consistent', () => {
    const lines = getCodeLines(tokenizedCode).map(l => getHtmlFromNode(l))
    expect(lines).toMatchSnapshot()
  })

  it('wrapChildNodes() utility wraps parent with multiple child nodes', () => {
    const wrapper = htmlToDocFragment('<table></table>')
    const children = [htmlToDocFragment('<foo/>'), htmlToDocFragment('<bar/>'), htmlToDocFragment('<span class="line">const testVariable: Valid = \'foo\'</span>')]
    const wrapped = pipe(wrapChildNodes(children)(wrapper), getHtmlFromNode)

    expect(wrapped).toBe('<table><foo></foo><bar></bar><span class="line">const testVariable: Valid = \'foo\'</span></table>')
  })

  it('addClassToDoc utility is able to add a class to the top-most node in Document', () => {
    const starting = htmlToDocument('<div class="foobar">testing</div>')
    const plusOne = pipe(starting, addClassToNode('one'))
    const plusTwo = pipe(plusOne, addClassToNode('two'))

    expect(pipe(plusOne, getClasslistFromNode)).length(2)
    expect(pipe(plusOne, getClasslistFromNode)).contains('one')
    expect(pipe(plusOne, getClasslistFromNode)).not.contains('two')

    expect(pipe(plusTwo, getClasslistFromNode)).length(3)
    expect(pipe(plusTwo, getClasslistFromNode)).contains('one')
    expect(pipe(plusTwo, getClasslistFromNode)).contains('two')
  })

  it('addClassToDoc utility is able to add a class to the top-most node in DocumentFragment', () => {
    const starting = htmlToDocFragment('<div class=\'foobar\'>testing</div>')
    const plusOne = pipe(starting, addClassToNode('one'))
    const plusTwo = pipe(plusOne, addClassToNode('two'))

    expect(pipe(plusOne, getClasslistFromNode)).length(2)
    expect(pipe(plusOne, getClasslistFromNode)).contains('one')
    expect(pipe(plusOne, getClasslistFromNode)).not.contains('two')

    expect(pipe(plusTwo, getClasslistFromNode)).length(3)
    expect(pipe(plusTwo, getClasslistFromNode)).contains('one')
    expect(pipe(plusTwo, getClasslistFromNode)).contains('two')
  })

  it('removeClassToDoc utility removes classes from DOM tree', () => {
    const starting = htmlToDocFragment('<div class=\'foobar\'>testing</div>')
    const falseFlag = pipe(starting, removeClassFromDoc('one'))
    const empty = pipe(falseFlag, removeClassFromDoc('foobar'))

    expect(pipe(falseFlag, getClasslistFromNode)).toContain('foobar')
    expect(pipe(empty, getClasslistFromNode)).lengthOf(0)
  })

  it('safeString', () => {
    const t1 = 'hi there'
    const t2 = '<div>hi there</div>'
    const t3 = '5 is > 4'
    const t4 = 'hi <span>there</span>'
    expect(safeString(t1)).toBe(t1)
    expect(safeString(t2)).toBe('hi there')
    expect(safeString(t3)).toBe(t3)
    expect(safeString(t4)).toBe('hi there')
  })
})

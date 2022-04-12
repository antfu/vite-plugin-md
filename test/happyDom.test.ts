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
  queryNode,
  removeClassFromDoc,
  wrapChildNodes,
  wrapCodeBlock,
  wrapEachLine,
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

    expect(html1.firstElementChild?.innerHTML).toEqual(tokenizedCode)
    expect(html2.firstElementChild?.innerHTML).toEqual(bareCode)

    expect(getHtmlFromNode(htmlToDocFragment(bareCode))).toEqual(bareCode)
  })

  it('code block split by lines and parsed can be reassembled without change', () => {
    const lines = getCodeLines(tokenizedCode)
    const code = getHtmlFromCodeLines(lines)

    expect(tokenizedCode).toBe(code)
  })

  it('wrap each line of code using wrapEachLine() utility', () => {
    const lines = getCodeLines(bareCode)
    const wrapped = wrapEachLine('<div class="wrapper" />')(lines)

    expect(
      wrapped,
      'empty lines should be excluded which includes first/last in this example',
    ).toHaveLength(5)
    for (const line of wrapped)
      expect(getHtmlFromNode(line).startsWith('<div class="wrapper"')).toBeTruthy()
  })

  it('wrapCodeBlock() utility allows the entire code block to be wrapped with a element', () => {
    const wrapped = wrapCodeBlock(
      '<div class="wrapper" />')(wrapEachLine('<span class="line" />')(getCodeLines(bareCode)),
    )

    const dom = queryNode(wrapped)
    const lines = dom.all('.line')
    const wrapper = dom.all('.wrapper')
    expect(wrapper).toHaveLength(1)
    expect(lines).toHaveLength(5)
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
    const starting = htmlToDocument('<div class=\'foobar\'>testing</div>')
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
})

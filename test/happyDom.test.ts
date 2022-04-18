import { pipe } from 'fp-ts/lib/function'
import { describe, expect, it } from 'vitest'
import type { DocRoot } from '../src/builders/code/utils/happyDom'
import {
  TAB_SPACE,
  addClass,
  createDocument,
  createElementNode,
  createFragment,
  createTextNode,
  getAttribute,
  into,
  isElementLike,
  nodeBoundedByElements,
  nodeChildrenAllElements,
  removeClass,
  safeString,
  select,
  setAttribute,
  toHtml,
  wrap,
} from '../src/builders/code/utils/happyDom'

const getClass = (node: DocRoot | string) => getAttribute('class')(node).split(/\s+/).filter(i => i)

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
    const d = createDocument(tokenizedCode)
    const d2 = createDocument(bareCode)
    const f = createFragment(tokenizedCode)
    const f2 = createFragment(bareCode)

    expect(toHtml(d.body.innerHTML)).toEqual(tokenizedCode)
    expect(toHtml(d2.body.innerHTML)).toEqual(bareCode)

    expect(toHtml(f)).toEqual(tokenizedCode)
    expect(toHtml(f2)).toEqual(bareCode)
  })

  it('HTML remains unchanged when passed into and out of DocumentFragment', () => {
    const html1 = createFragment(tokenizedCode)
    const html2 = createFragment(bareCode)
    const html3 = createFragment('\n\t<span>foobar</span>\n')

    expect(toHtml(html1)).toEqual(tokenizedCode)
    expect(toHtml(html2)).toEqual(bareCode)
    expect(toHtml(html3)).toEqual('\n\t<span>foobar</span>\n')

    expect(toHtml(createFragment(bareCode))).toEqual(bareCode)
  })

  it('basics', () => {
    const open = '<div class="wrapper">'
    const html = '<span>foobar</span>'
    const frag = createFragment(html)
    const openFrag = createFragment(open)

    expect(isElementLike(frag)).toBeTruthy()
    expect(isElementLike(openFrag)).toBeTruthy()

    expect(toHtml(frag.firstElementChild)).toBe(html)
    expect(frag.textContent).toBe('foobar')
    expect(frag.childNodes.length, 'HTML results in single child node').toBe(1)
    expect(frag.firstElementChild).not.toBeNull()
    expect(frag.firstElementChild).toBe(frag.lastElementChild)
    expect(frag.firstElementChild.tagName).toBe('SPAN')
    expect(frag.firstChild, 'node and element are equivalent').toBe(frag.firstElementChild)

    const text = 'hello world'
    const frag2 = createFragment(text)
    expect(frag2.textContent).toBe(text)
    expect(frag2.childNodes.length, 'text node results in single child node').toBe(1)
    expect(frag2.childNodes[0].hasChildNodes()).toBeFalsy()
    expect(frag2.firstElementChild).toBeNull()
    expect(frag2.firstChild).not.toBeNull()
    expect(frag2.firstChild.textContent).toBe(text)

    const hybrid = 'hello <span>world</span>'
    const frag3 = createFragment(hybrid)
    expect(frag3.textContent).toBe(text)
    expect(frag3.childNodes.length, 'hybrid node results two child nodes').toBe(2)
    expect(frag3.firstElementChild, 'hybrid has a "first element"').not.toBeNull()
    expect(frag3.firstChild, 'hybrid frag has a child').not.toBeNull()
    expect(frag3.firstChild.childNodes.length, 'hybrid firstChild node has children').not.toBeNull()
    expect(frag3.lastChild).toBe(frag3.lastElementChild)
    frag3.prepend('\n')
    frag3.lastElementChild.append('\n')
    expect(frag3.textContent).toBe('\nhello world\n')

    const siblings = '<span>one</span><span>two</span><span>three</span>'
    const frag4 = createFragment(siblings)
    expect(frag4.textContent).toBe('onetwothree')
    expect(frag4.childNodes).toHaveLength(3)
    expect(frag4.firstElementChild.textContent).toBe('one')
    frag4.firstElementChild.prepend('\n')
    frag4.lastElementChild.append('\n')
    expect(frag4.textContent).toBe('\nonetwothree\n')
    expect(nodeBoundedByElements(frag4)).toBeTruthy()
    expect(nodeChildrenAllElements(frag4)).toBeTruthy()

    const middling = '<span>one</span>two<span>three</span>'
    const frag5 = createFragment(middling)
    expect(frag5.textContent).toBe('onetwothree')
    expect(frag5.childNodes).toHaveLength(3)
    expect(frag5.firstElementChild.textContent).toBe('one')
    frag5.firstElementChild.prepend('\n')
    frag5.lastElementChild.append('\n')
    expect(frag5.textContent).toBe('\nonetwothree\n')
    expect(nodeBoundedByElements(frag5)).toBeTruthy()
    expect(nodeChildrenAllElements(frag5)).toBeFalsy()

    const tnode = createTextNode('hello')
    expect(tnode.hasChildNodes()).toBeFalsy()
  })

  it('select() utility', () => {
    const html = '<span class="foo bar">foobar</span>'
    const frag = createFragment(html)
    const missing = select(frag).first('.nonsense')

    expect(missing).toBe(null)
  })

  it('createFragment() utility', () => {
    const text = 'foobar'
    const html = '<span>foobar</span>'

    expect(toHtml(createFragment(html)), 'plain html').toBe(html)
    expect(toHtml(createFragment(createElementNode(html))), 'html as element').toBe(html)
    expect(toHtml(createFragment(text)), 'plain text').toBe(text)
    expect(toHtml(createFragment(createTextNode(text))), 'text as text node').toBe(text)
  })

  it('into() with multiple nodes injected', () => {
    const indent = '\n\t'
    const text = 'hello'
    const element = '<span>world</span>'
    const closeout = '\n'
    const html = `${indent}${text}${element}${closeout}`

    expect(toHtml(into()(indent, text, element, closeout))).toBe(html)
    expect(toHtml(into()([indent, text, element, closeout]))).toBe(html)

    expect(into()(indent, text, element, closeout).childNodes).toHaveLength(4)

    expect(
      toHtml(into('<div class="wrapper">')(indent, text, element, closeout)),
    ).toBe(`<div class="wrapper">${html}</div>`)
  })

  it('wrap() utility can add text around using before/after and indent', () => {
    const html = '<span>foobar</span>'
    const text = 'foobar'
    const siblings = '<span>one</span><span>two</span><span>three</span>'
    const middling = '<span>one</span>two<span>three</span>'
    const withSpecial = 'hey ho<span>\nlet\'s go\n</span>'

    const fHtml = createFragment(html)

    const wText = wrap('\n', '\n')(text)
    expect(wText, 'text passed into wrap returns html').toBe('\nfoobar\n')

    expect(wrap('\n', '\n')(html)).toBe('\n<span>foobar\n</span>')

    const wfHtml = wrap('\n', '\n')(fHtml)
    expect(wfHtml.textContent).toBe('\nfoobar\n')
    expect(toHtml(wfHtml), 'before "\\n" character should be external to <span> but after is inside').toBe('\n<span>foobar\n</span>')

    expect(
      wrap('\n', '\n')(siblings),
    ).toBe(`\n${siblings}\n`)

    expect(
      wrap(undefined, '\n')(siblings),
      'undefined before works',
    ).toBe(`${siblings}\n`)
    expect(wrap('\n', undefined)(siblings)).toBe(`\n${siblings}`)
    expect(wrap('\n', TAB_SPACE)(siblings)).toBe(`\n${siblings}${TAB_SPACE}`)
    expect(wrap('\n', '\n')(middling)).toBe(`\n${middling}\n`)
    expect(
      wrap('\n', '\n')(withSpecial),
    ).toEqual(`\n${withSpecial}\n`) // sibling nodes wrap after at end

    // indent
    expect(
      wrap('\n', '\n', 2)(html),
    ).toBe(
      `\n${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${html.replace('</span>', '\n</span>')}`,
    )

    const iSibilings = wrap('\n', '\n', 2)(siblings)
    expect(iSibilings).toBe(`\n${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${siblings}\n`)

    const iMiddlings = wrap('\n', '\n', 2)(middling)
    expect(iMiddlings).toBe(`\n${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${middling}\n`)

    expect(
      wrap('\n', '\n', 2)(withSpecial),
    ).toBe(
      `\n${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${TAB_SPACE}${withSpecial}\n`,
    )
  })

  it('wrap() works with fragment wrapper', () => {
    const html = '<span>foobar</span>'
    const text = 'foobar'
    const siblings = '<span>one</span><span>two</span><span>three</span>'
    const middling = '<span>one</span>two<span>three</span>'
    const wrapper = createFragment('<div class="wrapper" />')

    const w1 = wrap(wrapper)(html)
    expect(w1).toBe(`<div class="wrapper">${html}</div>`)

    const w2 = wrap(wrapper)(text)
    expect(w2).toBe(`<div class="wrapper">${text}</div>`)

    const w3 = wrap(wrapper)(siblings)
    expect(w3).toBe(`<div class="wrapper">${siblings}</div>`)

    const w4 = wrap(wrapper)(middling)
    expect(w4).toBe(`<div class="wrapper">${middling}</div>`)
  })

  it('setAttribute() utility', () => {
    const html = '<span>foo</span>'
    const frag = createFragment('<span>foo</span>')
    const setFoo = setAttribute('class')('foo')
    setFoo(frag)
    const html2 = setFoo(html)

    expect(toHtml(frag)).toBe('<span class="foo">foo</span>')
    expect(toHtml(html2)).toBe('<span class="foo">foo</span>')
  })

  it('addClass() utility is able to add a class to the top-most node in Document', () => {
    const html = '<div class="foobar">testing</div>'
    const frag = createFragment(html)
    const plusOne = pipe(frag, addClass('one'))
    const plusOneAlt = pipe(html, addClass('one'))

    const plusTwo = pipe(plusOne, addClass('two'))
    const plusTwoAlt = pipe(plusOneAlt, addClass('two'))

    expect(pipe(plusOne, getClass), `Class list from Frag input is: ${pipe(plusOne, getClass)}`).length(2)
    expect(pipe(plusOne, getClass)).contains('one')
    expect(pipe(plusOne, getClass)).not.contains('two')
    expect(pipe(plusOneAlt, getClass), `Class list from HTML input is: "${pipe(plusOneAlt, getClass)}"`).length(2)
    expect(pipe(plusOneAlt, getClass)).contains('one')
    expect(pipe(plusOneAlt, getClass)).not.contains('two')

    expect(pipe(plusTwo, getClass)).length(3)
    expect(pipe(plusTwo, getClass)).contains('one')
    expect(pipe(plusTwo, getClass)).contains('two')
    expect(pipe(plusTwoAlt, getClass)).length(3)
    expect(pipe(plusTwoAlt, getClass)).contains('one')
    expect(pipe(plusTwoAlt, getClass)).contains('two')
  })

  it('addClass() utility is able to add a class to the top-most node in DocumentFragment', () => {
    const starting = createFragment('<div class="foobar">testing</div>')
    const plusOne = pipe(starting, addClass('one'))
    const plusTwo = pipe(plusOne, addClass('two'))

    expect(pipe(plusOne, getClass)).length(2)
    expect(pipe(plusOne, getClass)).contains('one')
    expect(pipe(plusOne, getClass)).not.contains('two')

    expect(pipe(plusTwo, getClass)).length(3)
    expect(pipe(plusTwo, getClass)).contains('one')
    expect(pipe(plusTwo, getClass)).contains('two')
  })

  it('removeClassToDoc utility removes classes from DOM tree', () => {
    const starting = createFragment('<div class=\'foobar\'>testing</div>')
    const falseFlag = pipe(starting, removeClass('one'))
    const empty = pipe(falseFlag, removeClass('foobar'))

    expect(pipe(falseFlag, getClass)).toContain('foobar')
    expect(pipe(empty, getClass)).lengthOf(0)
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

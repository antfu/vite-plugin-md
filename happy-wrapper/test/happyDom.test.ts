import { pipe } from 'fp-ts/lib/function'
import { describe, expect, it } from 'vitest'
import type { IElement } from '../src'
import {
  addClass,
  addVueEvent,
  after,
  before,
  changeTagName,
  clone,
  createDocument,
  createElement,
  createFragment,
  createInlineStyle,
  createTextNode,
  filterClasses,
  getChildren,
  getClassList,
  getNodeType,
  hasParentElement,
  inspect,
  into,
  isElementLike,
  isHappyWrapperError,
  nodeBoundedByElements,
  nodeChildrenAllElements,
  removeClass,
  replaceElement,
  safeString,
  select,
  setAttribute,
  toHtml,
  wrap,
} from '../src'

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

  it('HTML remains unchanged when passed into and out of Fragment', () => {
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

    const textNode = createTextNode('hello')
    expect(textNode.hasChildNodes()).toBeFalsy()
  })

  it('inline style API', () => {
    const style = createInlineStyle()
      .addCssVariable('my-width', '45px')
      .addCssVariable('my-height', '65px')
      .addClassDefinition('.code-wrapper', c => c
        .addProps({
          display: 'flex',
          flexDirection: 'row',
        }),
      )

    const html = toHtml(style.finish())

    expect(html).toContain('--my-width: 45px;')
    expect(html).toContain('--my-height: 65px;')
    expect(html, html).toContain('display: flex;')
    expect(html, html).toContain('type="text/css"')

    const vHtml = toHtml(style.convertToVueStyleBlock('css', true).finish())
    expect(vHtml, vHtml).not.toContain('type="text/css"')
    expect(vHtml, vHtml).toContain('lang="css"')
  })

  it('inline style with nested selectors', () => {
    const style = createInlineStyle()
      .addClassDefinition('.code-wrapper', c => c
        .addProps({ height: '99px' })
        .addChild('.code-block', { display: 'flex' })
        .addChild('.foobar', { width: '25px' }),
      )
      .finish()

    const html = toHtml(style)
    expect(html).toContain('.code-wrapper {')
    expect(html).toContain('.code-wrapper .code-block {')
    expect(html).toContain('.code-wrapper .foobar {')
  })

  it('changeTag() utility works as expected with all container types', () => {
    const html = '<span class="foobar">hello world</span>'
    const toDiv = changeTagName('div')
    // html
    expect(toDiv(html)).toBe('<div class="foobar">hello world</div>')
    // element
    expect(
      toHtml(
        toDiv(createElement(html)),
      ),
    ).toBe('<div class="foobar">hello world</div>')
    // fragment
    expect(
      toHtml(
        toDiv(createFragment(html)),
      ),
    ).toBe('<div class="foobar">hello world</div>')
  })

  it('changeTag() can preserve parent node', () => {
    const toDiv = changeTagName('div')
    expect(
      toDiv('<span class="child">hello world</span>'),
    ).toBe('<div class="child">hello world</div>')

    const html = '<div class="parent"><span class="child">hello world</span></div>'
    const updated = select(html).updateAll('.child')(toDiv).toContainer()
    expect(updated).toBe('<div class="parent"><div class="child">hello world</div></div>')

    const node = createElement(html)
    const child = select(node).findFirst('.child', 'did not find child selector!')
    toDiv(child)
    expect(toHtml(node)).toBe('<div class="parent"><div class="child">hello world</div></div>')
  })

  it('changeTag() works with select().update()', () => {
    const html = '<div><span class="inside">inside</span></div>'
    const toTable = changeTagName('table')
    const converted = select(html).update()(toTable).toContainer()
    expect(converted).toBe('<table><span class="inside">inside</span></table>')

    const toTR = changeTagName('tr')
    const converted2 = pipe(
      html,
      select,
      s => s.update()(toTable),
      s => s.updateAll('span')(toTR),
      s => s.toContainer(),
    )
    expect(converted2).toBe('<table><tr class="inside">inside</tr></table>')
  })

  it('replaceElement() replaces an element while preserving parental relationship', () => {
    const html = '<div class="parent"><span class="child">hello world</span></div>'
    const onlySpan = html.replace(/div/g, 'span')
    const onlyDiv = html.replace(/span/g, 'div')
    const outside = replaceElement(
      createElement(onlySpan))(createElement(html),
    )
    // basic replacement where parent is not defined
    expect(toHtml(outside), onlySpan)

    // passing in the node during updateAll replaces the node
    const parent = createElement(html)
    const updated = select(parent)
      .updateAll('.child')(replaceElement('<div class="child">hello world</div>'))
      .toContainer()
    expect(toHtml(updated)).toBe(onlyDiv)

    // pulling out a node with a query and updated externally still
    // produces mutation on parent node
    const parent2 = createElement(html)
    const child = select(parent2).findFirst('.child', 'did not find child element!')
    replaceElement('<div class="child">hello world</div>')(child)
    expect(toHtml(parent2)).toBe(onlyDiv)
  })

  it('select() utility\'s find functionality', () => {
    const html = '<span class="foo bar">foobar</span>'
    const frag = createFragment(html)
    const missing = select(frag).findFirst('.nonsense')
    const bunchANothing = select(frag).findAll('.nonsense')

    expect(missing).toBe(null)
    expect(bunchANothing).toHaveLength(0)
  })

  it('select() utility\'s updateAll functionality', () => {
    const html = `
    <div class='wrapper'>
      <span class='line line-1'>1</span>
      <span class='line line-2'>2</span>
      <span class='line line-3'>3</span>
    </div>
    `
    const toDiv = changeTagName('div')
    const updated = select(html)
      .updateAll('.line')(toDiv)
      .toContainer()
    const found = select(updated).findAll('.line')

    expect(found).toHaveLength(3)
    const tags = found.map(f => f.tagName.toLowerCase())
    tags.forEach(t => expect(t).toBe('div'))
  })

  it('update() and updateAll() utility works as expected', () => {
    const html = `
    <div class="wrapper">
      <span class="line line-1">1</span>
      <span class="line line-2">2</span>
      <span class="line line-3">3</span>
    </div>
    `

    const toDiv = changeTagName('div')
    const toTable = changeTagName('table')
    const toTR = changeTagName('tr')
    const selector = select(html)

    const updated = selector
      .updateAll('.line')(toDiv)
      .toContainer()

    expect(updated).toBe(html.replace(/span/g, 'div'))

    const table = selector
      .update('.wrapper')(toTable)
      .updateAll('.line')(toTR)
      .toContainer()

    expect(table).toBe(`
    <table class="wrapper">
      <tr class="line line-1">1</tr>
      <tr class="line line-2">2</tr>
      <tr class="line line-3">3</tr>
    </table>
    `)

    // test other containers
    const updatedFrag = select(createFragment(html))
      .updateAll('.line')(toDiv)
      .toContainer()
    expect(toHtml(updatedFrag)).toBe(html.replace(/span/g, 'div'))

    const updatedElement = select(createElement(html.trim()))
      .updateAll('.line')(toDiv)
      .toContainer()
    expect(toHtml(updatedElement)).toBe(html.trim().replace(/span/g, 'div'))
  })

  it('createFragment() utility', () => {
    const text = 'foobar'
    const html = '<span>foobar</span>'

    expect(toHtml(createFragment(html)), 'plain html').toBe(html)
    expect(toHtml(createFragment(createElement(html))), 'html as element').toBe(html)
    expect(toHtml(createFragment(text)), 'plain text').toBe(text)
    expect(toHtml(createFragment(createTextNode(text))), 'text as text node').toBe(text)
  })

  it('before() allows a container to be injected before another container', async () => {
    const wrap = createElement('<div class="wrapper"></div>')
    const one = '<span class="item one">one</span>'
    const two = '<span class="item two">two</span>'
    const three = '<span class="item three">three</span>'
    const wrappedOneTwo = into(wrap)(one, two)
    // basic test with HTML
    const beforeTwo = before(two)
    const t1 = beforeTwo(one)
    expect(t1).toBe(`${two}${one}`)
    // a fragment should work the same
    const One = createFragment(one)
    expect(One.parentElement).toBeFalsy()
    const t2 = before(two)(One)
    expect(toHtml(t2)).toBe(`${two}${one}`)

    // an element without a parent, however, has no _natural parent_
    // so it should throw an error in this case
    const el = createElement(one)
    try {
      before(two)(el)
      throw new Error('element should have thrown error')
    }
    catch (err) {
      expect(isHappyWrapperError(err)).toBeTruthy()
      if (isHappyWrapperError(err))
        expect(err.name).toContain('before')
    }

    // intent is for: [one, three, two]
    const placed = select(wrappedOneTwo)
      .update('.two', 'did not find "two" class!')((el) => {
        expect(getClassList(el)).toContain('two')
        // the element must have a parent to be able to run before()
        expect(el.parentNode).toBeTruthy()

        // put three _before_ two
        before(three)(el)
        // parent should now have three children total
        expect(el?.parentNode?.childNodes.length, `parent node was: ${inspect(el.parentNode, true)}`).toBe(3)
        return el
      })
      .toContainer()

    const items = select(placed).findAll('.item')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toContain('one')
    expect(items[1].textContent).toContain('three')
    expect(items[2].textContent).toContain('two')
  })

  it('before() works in concert with select().updateAll()', () => {
    const html = '<div><span>one</span><span>two</span></div>'
    const injectBefore = before('<p>before</p>')
    const transformed = pipe(
      html,
      select,
      s => s.updateAll('span')(injectBefore),
      s => s.toContainer(),
    )

    expect(transformed).toBe('<div><p>before</p><span>one</span><p>before</p><span>two</span></div>')

    const injectWithIndex = (el: IElement, idx: number) => before(`<p>before ${idx}</p>`)(el)

    const transformed2 = pipe(
      html,
      select,
      s => s.updateAll('span')(injectWithIndex),
      s => s.toContainer(),
    )

    expect(transformed2).toBe('<div><p>before 0</p><span>one</span><p>before 1</p><span>two</span></div>')
  })

  it('after() works as expected', () => {
    const one = '<span class="item one">one</span>'
    const two = '<span class="item two">two</span>'
    const t1 = after(two)(one)
    expect(t1).toBe(`${one}${two}`)
  })

  it('into() with multiple nodes injected', () => {
    const wrapper = '<div class="my-wrapper"></div>'
    const indent = '\n\t'
    const text = 'hello'
    const element = '<span>world</span>'
    const closeout = '\n'
    const html = `${indent}${text}${element}${closeout}`

    expect(
      into(wrapper)(indent, text, element, closeout),
      'HTML wrapper passed in returns HTML with children inside',
    ).toBe(`<div class="my-wrapper">${html}</div>`)

    expect(
      into(wrapper)([indent, text, element, closeout]),
      'Children can be passed as an array too with no change in behavior',
    ).toBe(`<div class="my-wrapper">${html}</div>`)
    // try as a fragment
    const f = into(createFragment(wrapper))(indent, text, element, closeout)
    expect(
      toHtml(f),
      `HTML wrapper passed in returns HTML with children inside, instead got:\n${inspect(f, true)}`,
    ).toBe(`<div class="my-wrapper">${html}</div>`)
    // try as an IElement
    const el = into(createElement(wrapper))(indent, text, element, closeout)
    expect(
      toHtml(el),
      `HTML wrapper passed in returns HTML with children inside, instead got:\n${inspect(el, true)}`,
    ).toBe(`<div class="my-wrapper">${html}</div>`)

    const emptyParent = into()(indent, text, element, closeout)
    expect(toHtml(emptyParent)).toBe(html)
    // first two text elements are folded into one
    expect(
      emptyParent.childNodes,
      `\nchild nodes were: ${getChildren(emptyParent).map(c => getNodeType(c)).join(', ')}\n`,
    ).toHaveLength(3)

    expect(
      toHtml(into('<div class="wrapper">')(indent, text, element, closeout)),
    ).toBe(`<div class="wrapper">${html}</div>`)
  })

  it('into() using with updateAll() utility is able to mutate tree correctly', () => {
    // NOTE: the issue we're testing for is that the selector passed to updateAll()
    // is an IElement which _should_ have a parent element that contains it. When
    // when we call into() we are changing the hierarchy so that the parent of the incoming
    // element must now point to the _new_ parent node and this parent node in turn will
    // point to the incoming node
    const html = createElement('<div class="container"><span class="one item">one</span><span class="two item">two</span></div>')
    const wrapEach = '<span class="wrap-each"></span>'
    const expectedOutcome = '<div class="container"><span class="wrap-each"><span class="one item">one</span></span><span class="wrap-each"><span class="two item">two</span></span></div>'
    const sel = select(html)
    const wrapper = into(wrapEach)
    const result = sel
      .updateAll('.item')(wrapper)
      .toContainer()
    expect(toHtml(result)).toBe(expectedOutcome)
    expect(toHtml(html)).toBe(expectedOutcome)
    select(html).findAll('.item').forEach(i => expect(hasParentElement(i)).toBeTruthy())
  })

  it('wrap() works as expected', () => {
    const html = '<span>foobar</span>'
    const text = 'foobar'
    const siblings = '<span>one</span><span>two</span><span>three</span>'
    const middling = '<span>one</span>two<span>three</span>'
    const wrapper = createFragment('<div class="wrapper" />')

    const wrapHtml = wrap(html)
    const w1 = wrapHtml(clone(wrapper))
    expect(toHtml(w1)).toBe(`<div class="wrapper">${html}</div>`)

    const w2 = wrap(text)(clone(wrapper))
    expect(toHtml(w2)).toBe(`<div class="wrapper">${text}</div>`)

    const w3 = wrap(siblings)(clone(wrapper))
    expect(toHtml(w3)).toBe(`<div class="wrapper">${siblings}</div>`)

    const w4 = wrap(middling)(clone(wrapper))
    expect(toHtml(w4)).toBe(`<div class="wrapper">${middling}</div>`)

    const wrapper2 = '<div class="wrapper"><span class="interior"></span></div>'
    const anotherElement = '<span class="another">another element</span>'
    const wrapped = select(wrapper2)
      .update('.interior')(wrap(anotherElement))
      .toContainer()
    expect(wrapped).toBe('<div class="wrapper"><span class="interior"><span class="another">another element</span></span></div>')
  })

  it('wrap() using with updateAll() utility is able to mutate tree correctly', () => {
    const html = '<div class="container"><span class="one item">one</span><span class="two item">two</span></div>'
    const wrapEach = '<span class="wrap-each"></span>'
    const expectedOutcome = '<div class="container"><span class="one item">one<span class="wrap-each"></span></span><span class="two item">two<span class="wrap-each"></span></span></div>'
    const sel = select(html)
    const wrapper = wrap(wrapEach)
    const result = sel
      .updateAll('.item')(wrapper)
      .toContainer()
    expect(result).toBe(expectedOutcome)
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

  const addOne = addClass('one')
  const addTwo = addClass('two')

  it('addClass() utility is able to add a class to the top-most node in Document', () => {
    const html = '<div class="foobar">testing</div>'
    const doc = createDocument(html)
    const plusOne = pipe(doc, addOne)
    const plusTwo = pipe(clone(plusOne), addTwo)

    expect(pipe(plusOne, getClassList), `Class list from Frag input is: ${pipe(plusOne, getClassList)}`).length(2)
    expect(pipe(plusOne, getClassList)).contains('one')
    expect(pipe(plusOne, getClassList)).not.contains('two')

    expect(pipe(plusTwo, getClassList)).length(3)
    expect(pipe(plusTwo, getClassList)).contains('one')
    expect(pipe(plusTwo, getClassList)).contains('two')
  })

  it('addClass() utility is able to add a class to the top-most node in Fragment', () => {
    const html = '<div class="foobar">testing</div>'
    const frag = createFragment(html)
    const plusOne = pipe(frag, addOne)
    const plusTwo = pipe(clone(plusOne), addTwo)

    expect(pipe(plusOne, getClassList), `Class list from Frag input is: ${pipe(plusOne, getClassList)}`).length(2)
    expect(pipe(plusOne, getClassList)).contains('one')
    expect(pipe(plusOne, getClassList)).not.contains('two')

    expect(pipe(plusTwo, getClassList)).length(3)
    expect(pipe(plusTwo, getClassList)).contains('one')
    expect(pipe(plusTwo, getClassList)).contains('two')
  })

  it('addClass() utility is able to add a class to the top-most node in an IElement', () => {
    const html = '<div class="foobar">testing</div>'
    const el = createElement(html)
    const plusOne = pipe(el, addOne)
    const plusTwo = pipe(clone(plusOne), addTwo)

    expect(pipe(plusOne, getClassList)).length(2)
    expect(pipe(plusOne, getClassList)).contains('one')
    expect(pipe(plusOne, getClassList)).not.contains('two')

    expect(pipe(plusTwo, getClassList)).length(3)
    expect(pipe(plusTwo, getClassList)).contains('one')
    expect(pipe(plusTwo, getClassList)).contains('two')
  })

  it('removeClass() utility removes classes from DOM tree', () => {
    const starting = createFragment('<div class="foobar">testing</div>')
    const removeFoobar = removeClass('foobar')
    const removeOne = removeClass('one')

    const stillStanding = pipe(starting, removeOne)
    const empty = pipe(clone(stillStanding), removeFoobar)

    expect(pipe(stillStanding, getClassList)).toContain('foobar')
    expect(pipe(empty, getClassList)).lengthOf(0)
  })

  it('filterClasses() utility removes classes and optionally can pass in a callback', () => {
    const el = '<span class="foo bar baz color-1 color-2 color-3">text</span>'
    const noFoo = pipe(el, createElement, filterClasses('foo'), toHtml)
    expect(noFoo).toBe('<span class="bar baz color-1 color-2 color-3">text</span>')

    let removed: string[] = []
    const fancyRemoval = pipe(el, createElement, filterClasses(
      (r) => {
        removed = r
      },
      'foo', 'bar', /color-/,
    ), toHtml)

    expect(fancyRemoval).toBe('<span class="baz">text</span>')
    expect(removed).toContain('foo')
    expect(removed).toContain('bar')
    expect(removed).toContain('color-1')
    expect(removed).toContain('color-2')
    expect(removed).toContain('color-3')
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

  it('addVueEvent() adds an appropriate v-bind attribute', () => {
    const html = '<my-component>hello world</my-component>'
    const eventful = addVueEvent('onClick', 'doit()')(html)
    expect(eventful, eventful).toContain('v-bind="{')
    expect(eventful, eventful).toContain('doit()')

    const el = createElement(html)
    const eventful2 = addVueEvent('onClick', 'doit()')(el)
    expect(toHtml(eventful2), toHtml(eventful2)).toContain('v-bind="{')
    expect(toHtml(eventful2), toHtml(eventful2)).toContain('doit()')
  })
})

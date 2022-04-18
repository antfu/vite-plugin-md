/* eslint-disable @typescript-eslint/no-use-before-define */
import { Window } from 'happy-dom'
import type { Document, DocumentFragment, IElement, INode, IText, Node } from 'happy-dom'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import type { HTML } from '../types'

export const TAB_SPACE = ' '

/**
 * Converts an HTML string into a Happy DOM document tree
 */
export function createDocument(html: string): Document {
  const window = new Window()
  const document = window.document
  document.body.innerHTML = html
  return document
}

export function createFragment(content?: Container | HTML): DocumentFragment {
  const window = new Window()
  const document = window.document
  const fragment = document.createDocumentFragment() as DocumentFragment
  if (content)
    fragment.append(clone(content))

  return fragment
}

export function createTextNode(text: string): IText {
  const frag = createFragment(text)
  if (isTextNodeLike(frag))
    return frag.firstChild as IText
  else
    throw new Error(`the HTML passed in cannot be converted to a single text node: ${text}`)
}

export function createElementNode(html: string): IElement {
  const frag = createFragment(html)
  if (isElementLike(frag))
    return frag.firstElementChild
  else
    throw new Error(`the HTML passed in cannot be converted to a single element node: ${html}`)
}

export function isTextNode(node: Container | HTML): node is IText {
  if (typeof node === 'string') {
    const test = createFragment(node)
    return isTextNodeLike(test)
  }
  else {
    return typeof node === 'object' && !('firstElementChild' in (node as any))
  }
}

/**
 * Tests whether a doc type is wrapping only a text node
 */
export function isTextNodeLike(node: DocRoot) {
  return node.childNodes.length === 1 && isTextNode(node.firstChild)
}

export function htmlToNode(html: HTML) {
  const frag = createFragment(html)
  return frag as Node
}

export function htmlToElement(html: HTML): IElement {
  const frag = createFragment(html)
  if (hasSingularElement(frag))
    return frag.firstElementChild
  else
    throw new Error('ambiguous convertion to element')
}

function isDocument(dom: Container | HTML): dom is Document {
  return typeof dom === 'object' && !isElement(dom) && 'body' in dom
}
function isFragment(dom: Container | HTML): dom is DocumentFragment {
  return typeof dom === 'object' && !isElement(dom) && !isTextNode(dom) && dom.isConnected === false
}

export type NodeType = 'html' | 'text' | 'element' | 'node' | 'document' | 'fragment'
export type NodeSolverInput<T extends NodeType> = T extends 'html'
  ? HTML
  : T extends 'text'
    ? IText
    : T extends 'element'
      ? IElement
      : T extends 'node'
        ? INode
        : T extends 'document'
          ? Document
          : T extends 'fragment'
            ? DocumentFragment
            : unknown

export interface NodeSolverDict<O> {
  html: (input: HTML) => O extends 'mirror' ? HTML : O
  text: (input: IText) => O extends 'mirror' ? IText : O
  element: (input: IElement) => O extends 'mirror' ? IElement : O
  node: (input: INode) => O extends 'mirror' ? INode : O
  document: (input: Document) => O extends 'mirror' ? Document : O
  fragment: (input: DocumentFragment) => O extends 'mirror' ? DocumentFragment : O
}

/**
 * A fully configured solver which is ready to convert a node into type `O`; if `O` is never
 * then it will mirror the input type as the output type
 */
export type NodeSolverReady<E extends NodeType, O> = <N extends Exclude<Container | HTML | null, E>>(node: N) => O extends 'mirror'
  ? N
  : O

export interface NodeSolverReceiver<E extends NodeType, O> {
  /** provide a solver dictionary */
  solver: (solver: Omit<NodeSolverDict<O>, E>) => NodeSolverReady<E, O>
}

export interface NodeSolverWithExclusions<E extends NodeType> {
  /** provide a type which all solvers will convert to */
  outputType: <O>() => NodeSolverReceiver<E, O>
  /** the input type should be maintained as the output type */
  mirror: () => NodeSolverReceiver<E, 'mirror'>
}

export type NodeSolver = <E extends NodeType = never>(...exclude: E[]) => NodeSolverWithExclusions<E>

/**
 * A helper utility to help convert DOM nodes or HTML to common type.
 *
 * Start by providing the _exclusions_ you want to make for input. By default, all
 * `Container` types are allowed along with `HTML`
 */
export const solveForNodeType: NodeSolver = (_ = undefined as never) => {
  const solver = <EE extends NodeType, OO>(): NodeSolverReceiver<EE, OO> => ({
    solver: solver =>
      (node) => {
        if (!node)
          throw new Error('Node passed in was NULL')

        const type = getNodeType(node)
        if (type in solver) {
          const fn = (solver as any)[type]
          return fn(node)
        }
        else {
          if (type === 'node' && 'element' in solver && isElement(node)) {
            const fn = (solver as any).element
            return fn(node)
          }
          else if (type === 'node' && 'text' in solver && isTextNode(node)) {
            const fn = (solver as any).text
            return fn(node)
          }

          throw new Error(`Problem finding "${type}" in solver; had the following methods: ${Object.keys(solver)}`)
        }
      }
    ,
  })
  return {
    outputType: () => solver(),
    mirror: () => solver(),
  }
}

/**
 * Determines the "content-type" of a given node
 */
export const getNodeType = (node: Container | HTML): NodeType => {
  if (typeof node === 'string')
    return 'html'

  return isTextNode(node)
    ? 'text'
    : isElement(node)
      ? 'element'
      : isDocument(node)
        ? 'document'
        : isFragment(node)
          ? 'fragment'
          : 'node'
}

export type DocRoot = Document | DocumentFragment
export type DomNode = IElement | IText | INode
export type Container = DocRoot | DomNode

/**
 * Ensures any Container, array of Containers, or even HTML or HTML[] are all
 * normalized down to just HTML
 */
export function toHtml<D extends Container | HTML>(node: D | D[]): HTML {
  if (!Array.isArray(node))
    node = [node]

  const results = node.map((i) => {
    const convert = solveForNodeType()
      .outputType<HTML>()
      .solver({
        html: h => h,
        text: t => t.textContent,
        element: e => e.outerHTML,
        node: (n) => {
          if (isElement(n))
            convert(n)
          if (isTextNode(n))
            convert(n)

          throw new Error(
            `Unknown node type detected while converting to HTML: [ name: ${n.nodeName}, type: ${n.nodeType}, value: ${n.nodeValue} ]`,
          )
        },
        document: d => d.body.outerHTML,
        fragment: (f) => {
          if (isElementLike(f)) {
            return f.firstElementChild.outerHTML
          }
          else {
            const children = f.childNodes
            return children.map(c => convert(c)).join('')
          }
        },
      })

    return convert(i)
  })

  return results.join('')
}

/**
 * Wraps one or more content items _into_ a parent fragment (while optionally
 * allowing you to decorate the parent container ... by default it is an
 * empty shell)
 */
export const into = (parent?: DocRoot | IElement | HTML) => <C extends Container | HTML | Array<Container | HTML>>(...content: C[]): DocumentFragment => {
  const p = parent ? createFragment(parent) : createFragment()
  const flat = content.flatMap(c => c as Container | string)

  if (isTextNode(p) || isTextNodeLike(p)) {
    throw new Error(
      `The wrapper HTML is wrapping a text node; this is not allowed: ${toHtml(p)}`,
    )
  }

  const parentHasWrapper = p.hasChildNodes()

  flat.forEach((c) => {
    if (parentHasWrapper)
      p.firstElementChild.append(createFragment(c))
    else
      p.append(createFragment(c))
  })

  return p
}

/**
 * Allows various content-types to be wrapped into a single
 * DocumentFragment which contains each element as a sibling
 */
export const siblings = <
  C extends Container | HTML | Array<Container | HTML>,
>(...content: C[]) => {
  return into()(...content)
}

/**
 * Clones most DOM types
 */
export function clone<T extends Container | HTML>(container: T): T {
  const clone = solveForNodeType()
    .mirror()
    .solver({
      html: h => `${h}`,
      fragment: flow(toHtml, createFragment),
      document: flow(toHtml, createDocument),
      element: flow(toHtml, createElementNode),
      node: flow(toHtml, createFragment, f => f.firstElementChild ? f.firstElementChild : f.firstChild),
      text: flow(toHtml, createTextNode),
    })

  return clone(container)
}

/**
 * ensures that a given string doesn't have any HTML inside of it
 */
export function safeString(str: string): string {
  const node = createFragment(str)
  return node.textContent
}

export const select = <D extends Container | HTML>(node: D) => {
  const getDoc = solveForNodeType('node')
    .outputType<DocRoot>()
    .solver({
      fragment: flow(identity),
      html: flow(createFragment),
      document: flow(identity),
      element: flow(toHtml, createFragment),
      text: flow(toHtml, createFragment),
    })

  const n = getDoc(node)

  const api = {

    /**
     * query for _all_ nodes with given selector
     */
    all: (sel: string) => {
      return n.querySelectorAll(sel) as IElement[]
    },
    /**
     * query for the _first_ node with the given selector
     */
    first: (sel: string): IElement | null => {
      return n.querySelector(sel) as IElement | null
    },
    contains: (sel: INode) => {
      return n.contains(sel) as ReturnType<Document['contains']>
    },
    /**
     * Boolean check on whether the node has child nodes
     */
    hasChildNodes: () => {
      return n.hasChildNodes()
    },
    /**
     * Wrap each selected node with either a fragment or a `BeforeAfterWrapper`
     */
    wrapEach: <
      W extends FragWrapper | BeforeAfterWrapper,
    >(sel: string, ...wrapper: W) => {
      const found = n.querySelectorAll(sel) as IElement[]
      found.forEach(e => wrap(...wrapper)(e))
    },

    /**
     * Adds a class (or set of classes) to each item selected with the
     * selector string.
     *
     * Optionally allows providing a callback to each match found.
     * The callback will recieve the Node on callback. Returning `false`
     * removes it from consideration. Alternatively, returning the node
     * will allow the callback to modify it how it sees fit.
     *
     * Returning `undefined` or `true` accepts this node for consideration.
     */
    addClassToEach: (...klass: string[] | string[][]) =>
      (sel: string, cb?: ((el: IElement) => IElement | boolean | undefined)) => {
        const k = klass.flatMap(i => i).join(' ').split(/s+/g).filter(i => i)
        const found = n.querySelectorAll(sel)
        found.forEach((el) => {
          let verdict = true
          if (cb) {
            const result = cb(el)
            if (result === false)
              verdict = false
            else if (isElement(result))
              el = result
          }
          if (verdict)
            el.replaceWith(addClass(k)(el))
        })

        return api
      },

    toHTML: () => {
      return toHtml(n)
    },

    toContainer: () => {
      return n as D
    },
  }

  return api
}

export const setAttribute = (attr: string) => (value: string) => {
  const html = (h: HTML) => {
    const f = createFragment(h)
    f.firstElementChild.setAttribute(attr, value)
    return toHtml(f)
  }
  const fragment = (f: DocumentFragment) => {
    f.firstElementChild.setAttribute(attr, value)
    return f
  }
  const document = (d: Document) => {
    d.body.firstElementChild.setAttribute(attr, value)
    return d
  }
  const element = (e: IElement) => {
    e.setAttribute(attr, value)
    return e
  }

  return solveForNodeType('text', 'node').mirror().solver({
    html,
    fragment,
    document,
    element,
  })
}

export const getAttribute = (attr: string) => {
  return solveForNodeType('text', 'node')
    .outputType<string>()
    .solver({
      html: flow(createFragment, f => f.firstElementChild.getAttribute(attr), toHtml),
      fragment: flow(f => f.firstElementChild.getAttribute(attr)),
      document: flow(f => f.body.firstElementChild.getAttribute(attr)),
      element: flow(f => f.getAttribute(attr)),
    })
}

/**
 * Provides the classes defined on a given container's top level
 * element as an array of strings
 */
export const getClassList = (container: Container | HTML | null) => {
  return getAttribute('class')(container).split(/\s+/)
}

/**
 * Removes a class from the top level node of a container's body.
 *
 * Note: if the class wasn't present then no change is performed
 */
export const removeClass = (remove: string | string[]) => <D extends DocRoot | IElement | HTML>(doc: D): D => {
  doc = clone(doc)
  const getClass = getAttribute('class')
  const setClass = setAttribute('class')

  const current = getClass(doc).split(/\s+/g)
  if (!Array.isArray(remove))
    remove = [remove]

  const resultant = Array.from(
    new Set<string>(current.filter(c => !remove.includes(c))),
  )
    .filter(i => i)
    .join(' ')

  return setClass(resultant)(doc)
}

/**
 * Adds a class to the top level node of a document's body.
 */
export const addClass = (add: string | string[]) => <D extends DocRoot | IElement | HTML>(doc: D): D => {
  const getClass = getAttribute('class')
  const setClass = setAttribute('class')

  doc = clone(doc)

  const current = getClass(doc)?.split(/\s+/g) || []

  if (!Array.isArray(add))
    add = [add]

  const resultant = Array.from(new Set<string>([...current, ...add]))

  return setClass(resultant.join(' ').trim())(doc)
}

/**
 * Given a parent DOM node, this function allows one or more child nodes
 * to be added as child nodes
 * ```ts
 * const wrapped = wrapChildNodes(parent)(child1, child2)
 * ```
 */
export const parentNodeWithChildren = (wrapper: DocumentFragment | HTML) => (children: DocumentFragment | DocumentFragment[]) => {
  return typeof wrapper === 'string'
    ? _nest(createFragment(wrapper), children)
    : _nest(wrapper, children)
}

export const nodeIsEmpty = <D extends Container>(node: D) => {
  const content = toHtml(node).trim()
  return content.length === 0
}

export const nodeStartsWithElement = <D extends DocRoot>(node: D) => {
  return !!(
    'firstElementChild' in node
    && 'firstChild' in node
    && 'firstElementChild' in node
    && (node as any).firstChild === (node as any).firstElementChild
  )
}
export const nodeEndsWithElement = <
  D extends DocRoot,
>(node: D) => {
  return 'lastElementChild' in node && node.lastChild === node.lastElementChild
}

export const nodeBoundedByElements = <
  D extends DocRoot,
>(node: D) => {
  return nodeStartsWithElement(node) && nodeEndsWithElement(node)
}

/**
 * detects whether _all_ children of a give node are Elements
 */
export const nodeChildrenAllElements = <
  D extends DocRoot,
>(node: D) => {
  return node.childNodes.every(n => isElement(n))
}

/**
 * tests whether a given node has a singular Element as a child
 * of the given node
 */
export const hasSingularElement = <
  N extends DocRoot,
>(node: N) => {
  return nodeBoundedByElements(node) && node.childNodes.length === 1
}

export function isElement(frag: unknown): frag is IElement {
  return typeof frag === 'object' && 'outerHTML' in (frag as Object) && 'previousElementSibling' in (frag as Object)
}

/**
 * determines if a Doc/Doc Fragment is a wrapper for only a singular
 * `IElement` node
 */
export const isElementLike = <D extends DocRoot>(
  frag: D,
): boolean => {
  return typeof frag !== 'string' && frag.childNodes.length === 1 && nodeStartsWithElement(frag as any)
}

type FragWrapper = [DocumentFragment]
type BeforeAfterWrapper = [before?: string, after?: string, indent?: number]

function isBeforeAfterWrapper(args: FragWrapper | BeforeAfterWrapper): args is BeforeAfterWrapper {
  return !!(Array.isArray(args) && args.length > 1)
}

export type NodeTypeInput<T extends ReturnType<typeof getNodeType>> = T extends 'html'
  ? string
  : T extends 'text'
    ? IText
    : T extends 'element'
      ? IElement
      : T extends 'document'
        ? Document
        : T

export const wrap = <
  W extends FragWrapper | BeforeAfterWrapper,
>(...wrapper: W) => <
  C extends Container | HTML,
>(content: C): C => {
  const tab = (count = 1) => count === 0
    ? ''
    : ''.padStart(count * 2, TAB_SPACE)

  if (isBeforeAfterWrapper(wrapper)) {
    // eslint-disable-next-line prefer-const
    let [before, after, indent] = wrapper

    if (indent && indent !== 0)
      before = `${before || ''}${tab(indent)}`

    const html = (h: HTML) => pipe(h, createFragment, wrap(...wrapper), toHtml)
    const text = (t: IText) => createTextNode(`${before}${t.textContent}${after}`)

    const fragment = (f: DocumentFragment) => {
      const children = f.childNodes.length
      if (isTextNodeLike(f)) {
        const text = f.textContent
        return createFragment(`${before}${text}${after}`)
      }
      else {
        const first = f.firstChild
        const last = f.lastChild
        if (before) {
          if (isElement(first))
            f.prepend(createTextNode(before))
          else
            f.replaceChild(createTextNode(`${before}${first.textContent}`), first)
        }

        if (after) {
          if (children > 1) {
            // sibling nodes will have after added as new child node
            f.append(createTextNode(after))
          }
          else {
            if (isElement(last)) { last.append(createTextNode(after)) }
            else {
              f.lastChild.replaceChild(
                createTextNode(`${f.lastChild.textContent}${after}`),
                f.lastChild,
              )
            }
          }
        }
      }
      return f
    }

    const convert = solveForNodeType()
      .mirror()
      .solver({
        html,
        text,
        element: e => pipe(e),
        node: n => n,
        fragment,
        document: d => d,
      })

    return convert(content)
  }
  else {
    const w = clone(wrapper[0])
    const html = (h: HTML) => {
      return pipe(h, createFragment, fragment, toHtml)
    }
    const fragment = (f: DocumentFragment) => {
      w.firstChild.appendChild(f)
      return w
    }
    const document = (d: Document) => {
      w.firstChild.appendChild(d.body)
      return createDocument(toHtml(w))
    }
    const element = (e: IElement) => {
      w.firstChild.appendChild(e)
      return w.firstElementChild
    }

    const convert = solveForNodeType()
      .mirror()
      .solver({
        html,
        fragment,
        document,
        element,
        text: () => {
          throw new Error('Can\'t wrap a Text Node with anything and resolve to a Text Node!')
        },
        node: () => {
          throw new Error('Nodes which aren\'t IElement nodes can not be wrapped')
        },
      })

    return convert(content)
  }
}

function _nest(parent: DocumentFragment, children: DocumentFragment | DocumentFragment[]) {
  if (!Array.isArray(children))
    children = [children]

  // unwrap the wrapper div
  const node = parent.firstElementChild

  children.forEach((child) => {
    try {
      if (!node.hasChildNodes()) {
        node
          .firstElementChild
          .appendChild(child.firstElementChild)
      }
      else {
        node
          .lastElementChild
          .appendChild(child.firstElementChild)
      }
    }
    catch {
      // empty lines throw error
      // but the empty line is replaced with the parent/wrapper so the task has completed
    }
  })

  return clone(parent)
}

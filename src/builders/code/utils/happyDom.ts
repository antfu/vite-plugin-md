/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
  Document,
  DocumentFragment,
  IElement,
  INode,
  IText,
  Node,
} from 'happy-dom'
import {
  Text,
  Window,
} from 'happy-dom'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import type { Container, DocRoot, FragWrapper, HTML, NodeSolver, NodeSolverReady, NodeSolverReceiver, BeforeAfterWrapper as TextWrapper, ToHtmlOptions, Tree, TreeSummary, UpdateCallback } from '../types'

export const TAB_SPACE = ' '

export const isContainer = (thing: unknown): thing is Container => {
  return isDocument(thing) || isFragment(thing) || isElement(thing) || isTextNode(thing)
}

type InspectionTuple = [msg: string, item: unknown]

const isInspectionTuple = (thing: unknown): thing is InspectionTuple => {
  return Array.isArray(thing) && thing.length === 2 && typeof thing[0] === 'string' && !Array.isArray(thing[1])
}

export function isHappyWrapperError(err: unknown): err is HappyMishap {
  return typeof err === 'object' && (err as any).kind === 'HappyWrapper'
}
export class HappyMishap extends Error {
  public name = 'HappyWrapper'
  public readonly kind: 'HappyWrapper' = 'HappyWrapper'
  public trace: string[] = []
  constructor(
    message: string,
    options: {
      error?: unknown
      inspect?: unknown
      name?: string
    } = {}) {
    super()
    this.message = `\n${message}`
    if (options.name)
      this.name = `HappyWrapper::${options.name}`

    // proxy if already a HappyWrapper
    if (isHappyWrapperError(options.error))
      this.name = `HappyWrapper::${options.name || options.error.name}`

    if (options.error) {
      const name = options.error instanceof Error
        ? options.error.name.replace('HappyWrapper::', '')
        : 'unknown'
      const underlying = `\n\nThe underlying error message [${name}] was:\n${options.error instanceof Error ? options.error.message : String(options.error)}`
      this.message = `${this.message}${underlying}`
      this.trace = [...this.trace, name]
    }
    else {
      if (options.inspect) {
        const inspections = isInspectionTuple(options.inspect)
          ? [options.inspect]
          : Array.isArray(options.inspect)
            ? options.inspect
            : [options.inspect]

        inspections.forEach((i, idx) => {
          const intro = isInspectionTuple(i) ? `${i[0]}\n` : `${[idx]}:\n`
          const container = isInspectionTuple(i) ? i[1] : i

          this.message = `${this.message}\n\n${intro}${JSON.stringify(inspect(container), null, 2)}`
        })
      }
      if (this.trace.length > 1)
        this.message = `${this.message}\n\nTrace:${this.trace.map((i, idx) => `${idx}. ${i}`)}`
    }
  }
}

/**
 * A helper utility to help convert DOM nodes or HTML to common type.
 *
 * Start by providing the _exclusions_ you want to make for input. By default, all
 * `Container` types are allowed along with `HTML`
 */
export const solveForNodeType: NodeSolver = (_ = undefined as never) => {
  const solver = <EE extends NodeType, OO>(): NodeSolverReceiver<EE, OO> => ({
    solver: solver =>
      (node, parent) => {
        if (node === null)
          throw new Error('Value passed into solver was NULL!')
        if (node === undefined)
          throw new Error('Value passed into solver was UNDEFINED!')

        const type = getNodeType(node)
        if (type in solver) {
          const fn = (solver as any)[type]
          return fn(node, parent)
        }
        else {
          if (type === 'node' && 'element' in solver && isElement(node)) {
            const fn = (solver as any).element
            return fn(node, parent)
          }
          else if (type === 'node' && 'text' in solver && isTextNode(node)) {
            const fn = (solver as any).text
            return fn(node)
          }

          throw new HappyMishap(`Problem finding "${type}" in solver; had the following methods: ${Object.keys(solver)}`)
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
 * converts a IHTMLCollection or a INodeList to an array
 */
export const getChildren = (el: Container): (IElement | IText)[] => {
  if (!el.hasChildNodes())
    return []

  const output: (IElement | IText)[] = []
  let child = el.firstChild
  for (let idx = 0; idx < el.childNodes.length; idx++) {
    if (isElement(child) || isTextNode(child))
      output.push(child)
    else
      throw new HappyMishap('Unknown node type found while trying to convert children to an Array', { name: 'getChildrenAsArray', inspect: child })

    child = child.nextSibling
  }

  return output
}

/**
 * Converts an HTML string into a Happy DOM document tree
 */
export function createDocument(html: string): Document {
  const window = new Window()
  const document = window.document
  document.body.innerHTML = html
  return document
}

export function createFragment(content?: Container | Container[] | HTML): DocumentFragment {
  const window = new Window()
  const document = window.document
  const fragment = document.createDocumentFragment() as DocumentFragment
  if (content) {
    if (Array.isArray(content))
      content.forEach(c => fragment.append(clone(c)))
    else
      fragment.append(clone(content))
  }

  return fragment
}

export function createTextNode(text: string): IText {
  if (!text) {
    console.warn('An empty string was passed into createTextNode(); will be ignored but probably a mistake')
    return new Text('')
  }

  const frag = createFragment(text)
  if (isTextNodeLike(frag))
    return frag.firstChild as IText
  else
    throw new HappyMishap(`The HTML passed in cannot be converted to a single text node: "${text}".`, { name: 'createTextNode(text)', inspect: frag })
}

export const createElementNode = solveForNodeType()
  .outputType<IElement>()
  .solver({
    node: (n) => {
      if (isElement(n))
        return createElementNode(n) as IElement
      else
        throw new HappyMishap('can\'t create an IElement from an INode node because it doesn\'t have a tagName property', { inspect: n })
    },
    html: (h) => {
      const frag = createFragment(h)
      if (isElementLike(frag))
        return frag.firstElementChild
      else
        throw new HappyMishap('The HTML passed into createElementNode() is not convertable to a IElement node!', { name: 'createElementNode(html)', inspect: frag })
    },
    element: identity,
    text: (t) => {
      throw new HappyMishap('An IElement can not be created from a IText node because element\'s require a wrapping tag name!', { name: 'createElementNode(text)', inspect: t })
    },
    fragment: (f) => {
      if (isElementLike(f))
        return f.firstElementChild

      else
        throw new HappyMishap('Can not create an Element from passed in fragment', { name: 'createElementNode(fragment)', inspect: f })
    },
    document: (d) => {
      return createElementNode(createFragment(d.body.outerHTML))
    },
  })

export function isTextNode(node: unknown): node is IText {
  if (typeof node === 'string') {
    const test = createFragment(node)
    return isTextNodeLike(test)
  }
  else {
    return typeof node === 'object' && node !== null && !('firstElementChild' in (node as any))
  }
}

/**
 * Tests whether a doc type is wrapping only a text node
 */
export function isTextNodeLike(node: unknown) {
  return (isDocument(node) || isFragment(node)) && node?.childNodes?.length === 1 && isTextNode(node.firstChild)
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

function isDocument(dom: unknown): dom is Document {
  return typeof dom === 'object' && dom !== null && !isElement(dom) && 'body' in dom
}
function isFragment(dom: unknown): dom is DocumentFragment {
  return typeof dom === 'object' && dom !== null && !isElement(dom) && !isTextNode(dom) && !('body' in dom)
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

export const inspect = <T extends boolean>(item?: unknown, toJSON: T = false as T): false extends T ? Record<string, any> : string => {
  const solver = solveForNodeType()
    .outputType<Record<string, any>>()
    .solver({
      html: h => pipe(h, createFragment, f => inspect(f)),
      fragment: x => ({
        kind: 'DocumentFragment',
        children: `${x.children.length} / ${x.childNodes.length}`,
        ...(x.childNodes.length > 1
          ? {
              leadsWith: isElement(x.firstChild)
                ? 'element'
                : isTextNode(x.firstChild)
                  ? 'text'
                  : 'other',
              endsWith: isElement(x.lastChild)
                ? 'element'
                : isTextNode(x.lastChild)
                  ? 'text'
                  : 'other',
            }
          : {
              childNode: inspect(x.firstChild),
            }),
        content: x.textContent,
        childHtml: x.childNodes.map((i) => {
          try {
            return toHtml(i)
          }
          catch {
            return 'N/A'
          }
        }),
        html: toHtml(x),
      }),
      document: x => ({
        kind: 'Document',
        headerChildren: x.head.childNodes?.length,
        bodyChildren: x.body.childNodes?.length,
        body: toHtml(x.body),
        children: `${x.body.children?.length} / ${x.body.childNodes?.length}`,
        childContent: x.body.childNodes.map(i => i.textContent),
        childHtml: x.childNodes.map((i) => {
          try {
            return toHtml(i)
          }
          catch {
            return 'N/A'
          }
        }),
      }),
      text: x => ({
        kind: 'IText node',
        textContent: x.textContent,
        children: x.childNodes?.length,
        childContent: x.childNodes?.map(i => i.textContent),
      }),
      element: x => ({
        kind: 'IElement node',
        tagName: x.tagName,
        classes: getClassList(x),
        /**
         * in functions like wrap and pretty print, a "parent element" is provided
         * as a synthetic parent but if this flag indicates whether the flag has
         * a connected parent in a DOM tree.
         */
        hasNaturalParent: !!x.parentElement,
        textContent: x.textContent,
        children: `${x.children.length} / ${x.childNodes.length}`,
        childContent: x.childNodes?.map(i => i.textContent),
        childHtml: x.childNodes?.map((i) => {
          try {
            return toHtml(i)
          }
          catch {
            return 'N/A'
          }
        }),
        html: toHtml(x),
      }),
      node: n => ({
        kind: 'INode (generic)',
        looksLike: isElement(n) ? 'element' : isTextNode(n) ? 'text' : 'unknown',
        children: `${n.childNodes?.length}`,
        childContent: n.childNodes?.map(i => i.textContent),
        html: n.toString(),
      }),
    })
  const result = isContainer(item) || typeof item === 'string'
    ? solver(item)
    : {
        result: 'not found',
        type: typeof item,
        ...(typeof item === 'object' ? { keys: Object.keys(item as Object) } : { value: JSON.stringify(item) }),
      }
  return (toJSON ? JSON.stringify(result, null, 2) : result) as false extends T ? Record<string, any> : string
}

const removeSpecialChars = (input: string) => input.replace(/\\t/g, '').replace(/\\n/g, '').trim()
const truncate = (maxLength: number) => (input: string) => input.slice(0, maxLength)

export const tree = (node: Container | HTML): Tree => {
  const summarize = (tree: Omit<Tree, 'summary'>): Tree => {
    const summary = (n: Omit<Tree, 'summary'>): TreeSummary => {
      let ts: TreeSummary
      switch (n.type) {
        case 'text':
          ts = {
            node: `t(${pipe(n.node.textContent, removeSpecialChars, truncate(10))})`,
            children: n.children.map(c => summary(c)),
          }
          break
        case 'element':
        {
          const el = n.node as IElement
          ts = {
            node: `el(${el.tagName.toLowerCase()})`,
            children: n.children.map(c => summary(c)),
          }
          break
        }
        case 'node':
        {
          const node = n.node as INode
          ts = {
            node: `n(${pipe(node.nodeName, removeSpecialChars, truncate(10)) || pipe(node.textContent, removeSpecialChars, truncate(10))}`,
            children: n.children.map(c => summary(c)),
          }
          break
        }
        case 'fragment':
        {
          const f = n.node as DocumentFragment
          ts = {
            node: `frag(${f.firstElementChild ? f.firstElementChild.tagName.toLowerCase() : removeSpecialChars(f.textContent).trim().slice(0, 10)})`,
            children: n.children.map(c => summary(c)),
          }
          break
        }
        case 'document':
        {
          const d = n.node as Document
          ts = {
            node: `doc(${isElementLike(d) ? d.body.firstElementChild.tagName.toLowerCase() : d.textContent.slice(0, 10)})`,
            children: n.children.map(c => summary(c)),
          }
          break
        }
        default:
          ts = {
            node: 'u(?)',
            children: n.children.map(c => summary(c)),
          }
          break
      }
      return ts
    }

    const recurse = (level = 0) => (node: TreeSummary): string => {
      const indent = `${''.padStart(level * 6, ' ')}${level > 0 ? `${level}) ` : 'ROOT: '}`
      return `${indent}${node.node} ${node.children.length > 0 ? '⤵' : '↤'}\n${node.children.map(i => recurse(level + 1)(i))}`
    }

    return {
      ...tree,
      summary: () => summary(tree),
      toString: () => {
        const describe = summary(tree)
        return `\nTree Summary: ${describe.node}\n${''.padStart(40, '-')}\n${recurse(0)(describe)}`
      },
    }
  }

  const convert = (level: number): NodeSolverReady<never, Tree> => solveForNodeType()
    .outputType<Tree>()
    .solver({
      html: flow(createFragment, tree),
      text: t => summarize({
        type: 'text',
        node: t,
        level,
        children: t.childNodes.map(c => convert(level + 1)(c)),
      }),
      element: e => summarize({
        type: 'element',
        node: e,
        level,
        children: e.childNodes.map(c => convert(level + 1)(c)),
      }),
      node: n => summarize({
        type: 'node',
        node: n,
        level,
        children: n.childNodes.map(c => convert(level + 1)(c)),
      }),
      fragment: f => summarize({
        type: 'fragment',
        node: f,
        level,
        children: f.childNodes.map(c => convert(level + 1)(c)),
      }),
      document: d => summarize({
        type: 'document',
        node: d,
        level,
        children: d.childNodes.map(c => convert(level + 1)(c)),
      }),
    })

  return convert(0)(node)
}

export const prettyPrint = (level = 0): NodeSolverReady<never, string> => solveForNodeType()
  .outputType<string>()
  .solver({
    html: h => pipe(h, createFragment, prettyPrint(level)),
    element: (el, parent) => {
      const wrapConfig: TextWrapper = { before: '\n', close: '\n', indent: level }
      // use prettyPrint on child nodes
      const childHtml: string | undefined = el.hasChildNodes()
        ? el.tagName === 'PRE'
          ? el.innerHTML
          : el.childNodes.map(c => prettyPrint(level + 1)(c, clone(el))).join('')
        : undefined

      if (childHtml) {
        try {
          el.replaceChildren(childHtml)
        }
        catch (e) {
          throw new HappyMishap(`Problem replacing the "child html" of an element which is being run through prettyPrint: ${e instanceof Error ? e.message : String(e)}.\n The Child HTML was:\n${childHtml}\n`, { inspect: el, error: e })
        }

        if (level === 0 && !parent)
          parent = createElementNode('<div></div>')
        try {
          const { before, after, open, close, indent } = wrapConfig
          const wrapped = wrap({ open, close, indent })(el, parent)

          return `${before || ''}${tab(level)}${toHtml(wrapped)}${after || ''}`
        }
        catch (e) {
          throw new HappyMishap(`The IElement passed into prettyPrint() had child nodes whose HTML was:\n"${childHtml}"\n\nbut ran into problems when trying to wrap the IElement with the following wrap config:\n\n${JSON.stringify(wrapConfig)}`, { error: e, inspect: ['The parent element was', el], name: 'prettyPrint()' })
        }
      }
      else { return pipe(el, wrap(wrapConfig), toHtml) }
    },
    node: n => toHtml(n),
    text: t => toHtml(pipe(t, wrap({ open: '\n', indent: level }))),

    fragment: (f) => {
      // get child content as HTML
      const innerHTML = f.childNodes.map(
        child => prettyPrint(level)(child, f),
      ).join('')

      // replace old children with this HTML
      f.replaceChildren(innerHTML)

      // add indent to start and CR at end of HTML
      return toHtml(wrap({ indent: level, after: '\n' })(f))
    },
    document: (d) => {
      const head = prettyPrint(level)(createFragment(d.head))
      const body = prettyPrint(level)(createFragment(d.body))

      return `${head}\n${body}`
    },
  })

/**
 * Ensures any Container, array of Containers, or even HTML or HTML[] are all
 * normalized down to just HTML.
 *
 * Options allow for:
 * - `pretty` - make children indented from parent nodes
 * - `indent` - the base level of indentation for the block of HTML
 */
export function toHtml<D extends Container | HTML | null>(node: D | D[], options: ToHtmlOptions = {}): HTML {
  if (node === null)
    return ''

  if (!Array.isArray(node))
    node = [node]
  try {
    const results = node.map((i) => {
      const convert = solveForNodeType()
        .outputType<HTML>()
        .solver({
          html: h => h,
          text: t => t.textContent,
          element: e => options.pretty
            ? prettyPrint(options.indent || 0)(e)
            : e.outerHTML,
          node: (n) => {
            if (isElement(n))
              convert(n)
            if (isTextNode(n))
              convert(n)

            throw new Error(
              `Unknown node type detected while converting to HTML: [ name: ${n.nodeName}, type: ${n.nodeType}, value: ${n.nodeValue} ]`,
            )
          },
          document: d => d.body.outerHTML || '',
          fragment: (f) => {
            if (options.pretty)
              return prettyPrint(options.indent || 0)(f)

            if (isElementLike(f))
              return f.firstElementChild.outerHTML

            else
              return f.childNodes.map(c => convert(c, f)).join('')
          },
        })

      return convert(i)
    })

    return results.join('')
  }
  catch (e) {
    if (Array.isArray(node))
      throw new HappyMishap(`Problem converting an array of nodes [${node.length}: ${node.map(i => getNodeType(i as any)).join(', ')}] to HTML`, { name: 'toHTML([...])', inspect: ['first node', node[0]], error: e })

    else
      throw new HappyMishap(`Problem converting "${getNodeType(node)}" to HTML!`, { name: 'toHTML(getNodeType(node))', inspect: node, error: e })
  }
}

/**
 * When downsampling a Document or DocumentFragment to a IElement node/tree it
 * is often useful to remove all text nodes which only contain whitespace. The logic being
 * that if that is the case, and there remains a single Element child the conversion is
 * possible. If not, then an error must be thrown.
 */
export const removeWhitespaceFromChildren = <D extends DocRoot>(doc: D): D => {
  const children = isDocument(doc) ? doc.body : doc
  const remaining = children.childNodes.map((c) => {
    return isElement(c) || (
      c.textContent.trim().replace(/\\[tnr]/g, '').length > 0
    )
      ? c
      : undefined
  }).filter(i => i) as (IElement | IText)[]

  const newDoc = clone(doc)
  newDoc.replaceChildren(...remaining)

  return newDoc as D
}

/**
 * Wraps one or more content items _into_ a parent fragment (while optionally
 * allowing you to decorate the parent container ... by default it is an
 * empty shell)
 *
 * ```ts
 * const sandwich = into(bread)([p, b, j])
 * ```
 */
export const into = <P extends DocRoot | IElement | HTML | undefined>(
  /** The parent container (IElement, Document, Fragment, or even HTML) */
  parent?: P,
) => <C extends Container | HTML | Array<Container | HTML>>(
    /** Content which will be wrapped inside the parent */
    ...content: C[]
  ): undefined extends P? DocumentFragment : P => {
  /**
   * Keeps track of whether the incoming parent was wrapped in a temp
   * fragment. This is done for HTML passed in as it's the safest way
   * to process it this way before reverting it back to HTML.
   */
  const wrapped = !!(typeof parent === 'string')
  const p: DocRoot | IElement = wrapped
    ? createFragment(parent)
    : isElement(parent)
      ? clone(parent)
      : !parent
          ? createFragment()
          : parent

  // flatten children passed in to support both arrays and desstructed arrays
  const flat = content.flatMap(c => c as Container | string)

  if (isTextNodeLike(p)) {
    throw new HappyMishap(
      `The wrapper node -- when calling into() -- is wrapping a text node; this is not allowed. Parent HTML: "${toHtml(p)}"`, {
        name: 'into()',
        inspect: [
          ['parent node', parent],
        ],
      },
    )
  }

  const html = flat.map(c => toHtml(c)).join('')
  const transient = createFragment(html)
  const parentHasChildElements = p.children.length > 0

  if (parentHasChildElements)
    getChildren(transient).forEach(c => p.firstChild.appendChild(clone(c)))
  else
    getChildren(transient).forEach(c => p.append(c))

  return wrapped
    ? toHtml(p) as undefined extends P ? DocumentFragment : P
    : p as undefined extends P? DocumentFragment : P
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
      element: e => pipe(e, toHtml, createElementNode),
      node: flow(toHtml, createFragment, f => f.firstElementChild ? f.firstElementChild : f.firstChild),
      text: flow(toHtml, createTextNode),
    })

  return clone(container)
}

/**
 * Changes the tag name for the top level container element passed in.
 * ```ts
 * // <div>hi</div>
 * const html = changeTagName('div')(`<span>hi</span`)
 * ```
 */
export const changeTagName = (tagName: string) => {
  const replacer = (h: HTML, before: string, after: string) => {
    const open = new RegExp(`^<${before.toLocaleLowerCase()}`)
    const close = new RegExp(`<\/${before.toLocaleLowerCase()}>$`)
    return h
      .replace(open, `<${after}`)
      .replace(close, `</${after}>`)
  }

  const areTheSame = (before: string, after: string) => before.toLocaleLowerCase() === after.toLocaleLowerCase()

  return solveForNodeType()
    .mirror()
    .solver({
      html: (h) => {
        const before = createFragment(h).firstElementChild.tagName
        return areTheSame(before, tagName)
          ? h
          : replacer(h, before, tagName)
      },
      text: (t) => {
        throw new HappyMishap('Attempt to change a tag name for a IText node. This is not allowed.', { inspect: t, name: 'changeTagName(IText)' })
      },
      node: (n) => {
        throw new HappyMishap('Attempt to change a generic INode node\'s tag name. This is not allowed.', { inspect: n, name: 'changeTagName(INode)' })
      },
      element: el => areTheSame(el.tagName, tagName)
        ? el
        : createElementNode(replacer(toHtml(el), el.tagName, tagName)),

      fragment: (f) => {
        f.firstElementChild.replaceWith(
          pipe(clone(f.firstElementChild), changeTagName(tagName)),
        )
        return f
      },
      document: (d) => {
        d.body.firstElementChild.replaceWith(
          pipe(clone(d.body.firstElementChild), changeTagName(tagName)),
        )
        return d
      },
    })
}

/**
 * ensures that a given string doesn't have any HTML inside of it
 */
export function safeString(str: string): string {
  const node = createFragment(str)
  return node.textContent
}

/**
 * Allows the _selection_ of HTML or container type which is
 * then wrapped and a helpful query and mutation API is provided
 * to work with this element.
 */
export const select = <D extends Container | HTML>(node: D) => {
  const getDoc = solveForNodeType('node')
    .outputType<DocRoot>()
    .solver({
      fragment: flow(identity),
      html: flow(createFragment),
      document: flow(identity),
      // TODO: investigate whether this should be wrapped to a Fragment
      element: e => pipe(e, toHtml, createFragment),
      // TODO: investigate whether this should be wrapped to a Fragment
      text: flow(toHtml, createFragment),
    })

  const n = getDoc(node)

  const api = {

    /**
     * query for _all_ nodes with given selector
     */
    findAll: (sel: string) => {
      return n.querySelectorAll(sel) as IElement[]
    },
    /**
     * query for the _first_ node with the given selector
     */
    findFirst: (sel: string): IElement | null => {
      return n.querySelector(sel) as IElement | null
    },

    /**
     * Queries for the DOM node which matches the first DOM
     * node within the DOM tree which was selected and provides
     * a callback you can add to mutate this node.
     *
     * Note: by default if the query selection doesn't resolve any nodes then
     * this is a no-op but you can optionally express that you'd like it to
     * throw an error by setting "errorIfFound" to `true` or as a string if
     * you want to state the error message.
     */
    update: (selection: string, errorIfNotFound: boolean | string = false) => (mutate: UpdateCallback<IElement>) => {
      const found = n.querySelector(selection)as IElement | null
      if (found) { found.replaceWith(mutate(clone(found), 0, 1)) }
      else {
        if (errorIfNotFound) {
          throw new HappyMishap(errorIfNotFound === true
            ? `The selection "${selection}" was not found so the update() operation wasn't able to be run`
            : errorIfNotFound,
          {
            name: 'select(x).update(sel)',
            inspect: ['parent node', n],
          })
        }
      }

      return api
    },

    /**
     * mutate _all_ nodes with given selector; if no selector provided then
     * all child nodes will be selected.
     *
     * Note: when passing in a selector you will get back an array of `IElement`
     * but if you're iterating over over all children the type will be `INode`
     * but you can use the `isElement` and `isTextNode` type guards to narrow types.
     */
    updateAll: <S extends string | undefined>(selection?: S) =>
      <N extends S extends string ? IElement : INode>(mutate: UpdateCallback<N>) => {
        const elements: N[] = (
          selection
            ? n.querySelectorAll(selection)
            : n.childNodes
        ) as N[]

        elements.forEach((el, idx) => {
          if (isElement(el) || isTextNode(el)) {
            try {
              el.replaceWith(
                mutate(el, idx, elements.length),
              )
            }
            catch (e) {
              throw new Error(`updateAll(): problem updating an element with the passed in callback function:  \n\t${mutate.toString()}\n\n${e instanceof Error ? e.message : String(e)}.\n${JSON.stringify(inspect(el), null, 2)}\n\nThe callback function was:`)
            }
          }
          else {
            throw new Error(`Ran into an unknown node type while running updateAll(): ${JSON.stringify(inspect(el), null, 2)}`)
          }
        })
        return api
      },

    /**
     * Boolean check on whether the node has child nodes
     */
    hasChildNodes: () => {
      return n.hasChildNodes()
    },
    /**
     * Wrap each selected node with either a Fragment or a `BeforeAfterWrapper`
     */
    wrapEach: (selection?: string) => <W extends FragWrapper | TextWrapper>(wrapper: W) => {
      const found = selection
        ? n.querySelectorAll(selection)
        : n.childNodes.filter(i => isElement(i))
      found.forEach(e => wrap(wrapper)(e, n))

      return api
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
        const k = klass
          .flatMap(i => i)
          .join(' ')
          .split(/s+/g)
          .filter(i => i)

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
      return (typeof node === 'string' ? toHtml(n) : n) as D
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
      html: flow(createFragment, f => f.firstElementChild.getAttribute(attr)),
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
  return getAttribute('class')(container)?.split(/\s+/) || []
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

export function isElement(el: unknown): el is IElement {
  return typeof el === 'object' && el !== null && 'outerHTML' in (el as Object) && 'previousElementSibling' in (el as Object)
}

/**
 * determines if a Doc/Doc Fragment is a wrapper for only a singular
 * `IElement` node
 */
export const isElementLike = <D extends DocRoot>(
  frag: D,
): boolean => {
  return typeof frag !== 'string' && frag.childNodes.length === 1 && frag.firstChild === frag.firstElementChild
}

function isTextWrapper(
  args: FragWrapper | TextWrapper,
): args is TextWrapper {
  return typeof args === 'object' && (
    ('before' in args) || ('after' in args) || ('indent' in args) || ('open' in args) || ('close' in args)
  )
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

export const tab = (count = 1) => count === 0
  ? ''
  : ''.padStart(count * 2, TAB_SPACE)
export const wrap = <
  W extends FragWrapper | TextWrapper,
  >(wrapper: W) => <
    C extends Container | HTML,
    P extends IElement | DocRoot,
    >(content: C, parent?: P): C => {
    if (isTextWrapper(wrapper)) {
      // eslint-disable-next-line prefer-const
      let { open, before, close, after, indent } = wrapper

      if (indent && indent !== 0) {
        // before the tag starts
        before = `${before || ''}${tab(indent)}`
        // before the closing tag but on the interior of tag
        close = close ? `${close}${tab(indent)}` : undefined
      }

      const html = (h: HTML) => pipe(h, createFragment, wrap(wrapper), toHtml)

      /**
       * An `IText` node will be wrapped with open, before, and after but NOT _close_.
       * This is because a text node has no **tag** and therefore `close` no longer
       * really makes sense.
       */
      const text = (t: IText) => {
        const node = createTextNode(`${open || ''}${before || ''}${t.textContent}${after || ''}`)
        return node
      }

      /**
       * **IElement** handler for content wrapping
       */
      const element = (el: IElement, parent?: IElement | DocRoot): IElement => {
        try {
          if (open)
            el.replaceChildren(createTextNode(open), ...el.childNodes)

          if (close)
            el.replaceChildren(...el.childNodes, createTextNode(close))

          if (before && parent)
            parent.prepend(createTextNode(before))
          else if (before && el.parentElement)
            el.parentElement.prepend(createTextNode(before))
          if (before && !parent && !el.parentElement) {
            const warn = 'An IElement was passed into wrap() which had a "before" wrapping but no parent was passed in.'
            if (indent === 0) { console.warn(`${warn}. Because there is no indent level, we will ignore this and continue.`) }
            else {
              throw new HappyMishap('An IElement was passed into wrap() which had a "before" wrapping but no parent was passed in. This is not allowed!', {
                inspect: [
                  ['element was: ', el],
                  ['natural parent: ', el.parentElement],
                  ['parent was:', parent],
                ],
                name: 'wrap() -> element',
              })
            }
          }

          if (after && parent)
            parent.append(createTextNode(after))
          if (after && !parent)
            throw new HappyMishap('An IElement was passed into wrap() which had an "after" wrapping but no parent was passed in. This is not allowed!', { inspect: el })

          return el
        }
        catch (e) {
          throw new HappyMishap(`Problem wrapping an IElement[${el.tagName.toLowerCase()}] with a wrap config of:\n\t${JSON.stringify(wrapper)}`, { inspect: el, error: e })
        }
      }

      /**
       * Handle `DocumentFragment` containers.
      */
      const fragment = (f: DocumentFragment) => {
        if (isElementLike(f) && (open || close)) {
          wrap(wrapper)(f.firstElementChild, f)
        }
        else if (isTextNodeLike(f) && (open || close)) {
          wrap(wrapper)(f.firstChild, f)
        }
        else {
          if (before)
            f.prepend(createTextNode(before))
          if (after)
            f.append(createTextNode(after))
        }

        return f
      }
      // CONVERT when using TextWrapper structure
      const convert = solveForNodeType()
        .mirror()
        .solver({
          html,
          text,
          element,
          node: (n) => {
            throw new HappyMishap('Can not wrap() a bare INode node', { name: 'wrap(INode)', inspect: n })
          },
          fragment,
          document: d => d,
        })

      return convert(content, parent)
    }
    // Wrapping a Fragment
    else {
      const w = typeof wrapper === 'string'
        ? createFragment(wrapper) as DocumentFragment
        : isFragment(wrapper)
          ? clone(wrapper)
          : createFragment(wrapper)
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
          text: (t) => {
            throw new HappyMishap('Can\'t wrap a Text Node with anything and resolve to a Text Node!', { name: 'wrap(text)', inspect: t })
          },
          node: (n) => {
            throw new HappyMishap('Generic INode nodes can not be wrapped (only IElement)!', { name: 'wrap(INode)', inspect: n })
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

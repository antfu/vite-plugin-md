import { Window } from 'happy-dom'
import type { Document, DocumentFragment, INode } from 'happy-dom'
import { pipe } from 'fp-ts/lib/function'
import type { HTML } from '../types'
const TAB_SPACING = 4

/**
 * Converts an HTML string into a Happy DOM document tree
 */
export function htmlToDocument(html: string): Document {
  const window = new Window()
  const document = window.document
  document.body.innerHTML = html
  return document
}

export function htmlToDocFragment(html: HTML): DocumentFragment {
  const window = new Window()
  const document = window.document
  const fragment = document.createDocumentFragment() as DocumentFragment
  fragment.append(`<div>${html || ''}</div>`)

  return fragment
}

function isDocument(dom: Document | DocumentFragment): dom is Document {
  return 'body' in dom
}

export function getHtmlFromNode<D extends Document | DocumentFragment>(dom: D | D[]): HTML {
  if (!Array.isArray(dom))
    dom = [dom]

  const fragments = dom
    .map(frag => isDocument(frag)
      ? frag.body.innerHTML || ''
      : frag.firstElementChild.innerHTML,
    )

  return fragments.join('\n')
}

export function cloneNode<D extends Document | DocumentFragment>(doc: D): D {
  return (isDocument(doc)
    ? pipe(doc, getHtmlFromNode, htmlToDocument)
    : pipe(doc, getHtmlFromNode, htmlToDocFragment)) as D
}

/**
 * Converts a code block to an array of _lines_
 * with each line parsed with Happy DOM
 */
export function getCodeLines(html: string): DocumentFragment[] {
  return (html || '\n').split(/\r?\n/g).map(l => htmlToDocFragment(l))
}

/**
 * ensures that a given string doesn't have any HTML inside of it
 */
export function safeString(str: string): string {
  const node = htmlToDocFragment(str)
  return node.textContent
}

export interface SelectorApi<D extends Document | DocumentFragment> {
  all: (query: string) => ReturnType<D['querySelectorAll']>
  first: (query: string) => ReturnType<D['querySelector']>
  contains: (query: INode) => ReturnType<D['contains']>
  hasChildNodes: () => boolean
}

export const queryNode = <D extends Document | DocumentFragment>(node: D) => {
  return {
    all: (sel: string) => {
      return node.querySelectorAll(sel) as ReturnType<D['querySelectorAll']>
    },
    first: (sel: string) => {
      return node.querySelector(sel) as ReturnType<D['querySelector']>
    },
    contains: (sel: INode) => {
      return node.contains(sel) as ReturnType<D['contains']>
    },
    hasChildNodes: () => {
      return node.hasChildNodes()
    },
  }
}

export const queryHtml = (html: string) => {
  const node = htmlToDocFragment(html)
  return queryNode(node)
}

/**
 * Converts the lines of a code block back to an
 * HTML string
 */
export function getHtmlFromCodeLines(lines: DocumentFragment[]): HTML {
  return lines.map(l => getHtmlFromNode(l)).join('\n')
}

/**
 * Removes a class from the top level node of a document's body.
 *
 * Note: if the class wasn't present then no change is performed
 */
export const removeClassFromDoc = (remove: string) => <D extends Document | DocumentFragment>(doc: D) => {
  doc = cloneNode(doc)
  const node = isDocument(doc) ? doc.body : doc.firstElementChild
  const classes = node.firstElementChild.getAttribute('class')?.split(/\s+/g) || []

  node
    .firstElementChild
    .setAttribute(
      'class',
      classes.filter(c => c !== remove).join(' ').trim(),
    )
  return doc
}
/**
 * Adds a class to the top level node of a document's body.
 */
export const addClassToNode = (add: string | string[]) =>
  <
    D extends Document | DocumentFragment,
  >(doc: D): D => {
    if (!Array.isArray(add))
      add = [add]

    const cloned: D = cloneNode(doc)
    const node = isDocument(cloned) ? cloned.body : cloned.firstElementChild
    const classes = node.firstElementChild?.getAttribute('class')?.split(/\s+/g) || []

    node.firstElementChild.setAttribute(
      'class',
      [...classes, add.join(' ')].join(' ').trim(),
    )

    return cloned
  }

export const addAttributeToNode = (attr: string, val: string) =>
  <
    D extends Document | DocumentFragment,
  >(doc: D): D => {
    const cloned: D = cloneNode(doc)
    const node = isDocument(cloned) ? cloned.body : cloned.firstElementChild

    node.firstElementChild.setAttribute(attr, val)

    return cloned
  }

export const getClasslistFromNode = <D extends Document | DocumentFragment>(doc: D): string[] => {
  return isDocument(doc)
    ? doc.body.firstElementChild?.getAttribute('class')?.split(/\s+/g).filter(i => i) || []
    // note: first element child is the wrapper div we put in with htmlToDoc
    : doc.firstElementChild?.firstElementChild?.getAttribute('class')?.split(/\s+/g).filter(i => i) || []
}

/**
 * Provides one or more "child" nodes and then add a wrapper element
 * ```ts
 * const wrapped = wrapChildNodes(child1, child2)(parent)
 * ```
 */
export const wrapChildNodes = (children: DocumentFragment | DocumentFragment[]) => (wrapper: DocumentFragment) => {
  return wrap(wrapper, children) as DocumentFragment
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
    ? wrap(htmlToDocFragment(wrapper), children)
    : wrap(wrapper, children)
}

export const nodeIsEmpty = <D extends Document | DocumentFragment>(node: D) => {
  const content = getHtmlFromNode(node).trim()
  return content.length === 0
}

/**
 * Wrap each element with some given text.
 */
export const wrapWithText = (before?: string, after?: string, indent = 0) => <D extends DocumentFragment | DocumentFragment[]>(fragments: D): D => {
  const frags: DocumentFragment[] = Array.isArray(fragments) ? fragments : [fragments]

  const tab = (count = 1) => count === 0
    ? ''
    : ''.padStart(count, '\t')

  if (indent !== 0) {
    before = before
      ? `${tab(indent)}${before}`
      : undefined
  }

  before = before || ''
  after = after || ''

  const newFrags = frags.map((f) => {
    return pipe(
      f,
      cloneNode,
      getHtmlFromNode,
      (html) => {
        const preFormatting = html
          .replace(/(\s*)$/, '')
          .replace(html.trim(), '')
        const postFormatting = html
          .replace(/^(\s*)/, '')
          .replace(html.trim(), '')
        const rest = html
          .replace(preFormatting, '')
          .replace(postFormatting, '')
        console.log({ html, preFormatting, postFormatting, rest, before, after, all: `${preFormatting}${before}${rest}${after}${postFormatting}` })

        return `${preFormatting}${before}${rest}${after}${postFormatting}`
      },
      htmlToDocFragment,
    )
  })

  return (Array.isArray(fragments) ? newFrags : newFrags[0]) as D
}

function wrap(parent: DocumentFragment, children: DocumentFragment | DocumentFragment[]) {
  if (!Array.isArray(children))
    children = [children]

  // unwrap the wrapper div
  const node = parent.firstElementChild
  children.forEach((child) => {
    try {
      if (!node.hasChildNodes()) {
        node
          .firstElementChild
          .appendChild(
            child.firstElementChild.firstChild,
          )
      }
      else {
        node
          .lastElementChild
          .appendChild(
            htmlToDocFragment(getHtmlFromNode(child)).firstElementChild.firstChild,
          )
      }
    }
    catch {
      // empty lines throw error
      // but the empty line is replaced with the parent/wrapper so the task has completed
    }
  })

  return cloneNode(parent)
}

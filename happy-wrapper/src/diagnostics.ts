import { flow, pipe } from 'fp-ts/lib/function'
import { getClassList } from './attributes'
import { createFragment } from './create'
import type { Container, ContainerOrHtml, HTML, NodeSolverReady, Tree, TreeSummary, UpdateSignature } from './happy-types'
import { getChildren, into } from './nodes'
import { isContainer, isElement, isElementLike, isTextNode, isTextNodeLike, isUpdateSignature } from './type-guards'
import { getNodeType, solveForNodeType, toHtml } from './utils'
import type { Document, Fragment, IElement, INode } from './index'

export const describeNode = (node: Container | HTML | null | UpdateSignature | any[]): string => {
  if (!node)
    return node === null ? '[null]' : 'undefined'
  else if (isUpdateSignature(node))
    return `UpdateSignature(${describeNode(node[0])})`
  else if (Array.isArray(node))
    return node.map(i => describeNode(i)).join('\n')

  return solveForNodeType()
    .outputType<string>()
    .solver({
      html: h => pipe(h, createFragment, describeNode),
      node: n => `node${descClass(n)}`,
      text: t => `text[${t.textContent.slice(0, 5).replace('\n', '')}...]`,
      element: e => `element[${e.tagName.toLowerCase()}]${descClass(e)}`,
      fragment: f => `fragment${descFrag(f)}`,
      document: d => `doc[head: ${!!d.head}, body: ${!!d.body}]: ${describeNode(createFragment(d.body))}`,
    })(node)
}

export const inspect = <T extends boolean>(item?: unknown, toJSON: T = false as T): false extends T ? Record<string, any> : string => {
  const solver = Array.isArray(item)
    ? () => item.map(i => describeNode(i))
    : solveForNodeType()
      .outputType<Record<string, any>>()
      .solver({
        html: h => pipe(h, createFragment, f => inspect(f)),
        fragment: x => ({
          kind: 'Fragment',
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
          childDetails: x.childNodes.map((i) => {
            try {
              return {
                html: toHtml(i),
                nodeType: getNodeType(i),
                hasParentElement: !!i.parentElement,
                hasParentNode: i.parentNode ? `${getNodeType(i.parentNode)} [type:${i.parentNode.nodeType}]` : false,
                childNodes: i.childNodes.length,
              }
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
          childTextContent: x.body.childNodes.map(i => i.textContent),
          childDetails: x.childNodes.map((i) => {
            try {
              return {
                html: toHtml(i),
                nodeType: getNodeType(i),
                hasParentElement: !!i.parentElement,
                hasParentNode: i.parentNode ? `${getNodeType(i.parentNode)} [type:${i.parentNode.nodeType}]` : false,
                childNodes: i.childNodes.length,
              }
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
          ...(x.parentElement ? { parent: describeNode(x.parentElement) } : {}),
          textContent: x.textContent,
          children: `${x.children.length} / ${x.childNodes.length}`,
          childContent: x.childNodes?.map(i => i.textContent),
          childDetails: x.childNodes.map((i) => {
            try {
              return {
                html: toHtml(i),
                nodeType: getNodeType(i),
                hasParentElement: !!i.parentElement,
                hasParentNode: i.parentNode ? `${getNodeType(i.parentNode)} [type:${i.parentNode.nodeType}]` : false,
                childNodes: i.childNodes.length,
              }
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
        ...(typeof item === 'object' && item !== null ? { keys: Object.keys(item as Object) } : { value: JSON.stringify(item) }),
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
          const f = n.node as Fragment
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

/**
 * Allows various content-types to be wrapped into a single
 * Fragment which contains each element as a sibling
 */
export const siblings = <C extends UpdateSignature | ContainerOrHtml[]>
  (...content: C) => {
  return into()(...content)
}

function descClass(n: Container) {
  const list = getClassList(n)
  return list.length > 0 ? `{ ${list.join(' ')} }` : ''
}

function descFrag(n: Fragment) {
  const children = getChildren(n).map(i => describeNode(i))
  return isElementLike(n)
    ? `[el: ${n.firstElementChild.tagName.toLowerCase()}]${descClass}`
    : isTextNodeLike(n)
      ? `[text: ${n.textContent.slice(0, 4).replace(/\n+/g, '')}...]`
      : `[children: ${children.length > 0 ? `${children.join(', ')}` : 'none'}]`
}


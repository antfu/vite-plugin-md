import { flow, pipe } from 'fp-ts/lib/function'
import { createDocument, createElement, createFragment, createTextNode } from './create'
import { HappyMishap } from './errors'
import type { Container, ContainerOrHtml, HTML, NodeSolver, NodeSolverReceiver, NodeType } from './happy-types'
import { isDocument, isElement, isElementLike, isFragment, isTextNode } from './type-guards'

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

/**
 * A helper utility to help convert DOM nodes or HTML to common type.
 *
 * Start by providing the _exclusions_ you want to make for input. By default, all
 * `Container` types are allowed along with `HTML`
 */
export const solveForNodeType: NodeSolver = (_ = undefined as never) => {
  const solver = <EE extends NodeType, OO>(): NodeSolverReceiver<EE, OO> => ({
    solver: s =>
      (node, parent) => {
        if (node === null)
          throw new Error('Value passed into solver was NULL!')
        if (node === undefined)
          throw new Error('Value passed into solver was UNDEFINED!')

        const type = getNodeType(node)
        if (type in s) {
          const fn = (s as any)[type]
          return fn(node, parent)
        }
        else {
          if (type === 'node' && 'element' in s && isElement(node)) {
            const fn = (s as any).element
            return fn(node, parent)
          }
          else if (type === 'node' && 'text' in s && isTextNode(node)) {
            const fn = (s as any).text
            return fn(node)
          }

          throw new HappyMishap(`Problem finding "${type}" in solver.`, { name: `solveForNodeType(${type})` })
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
 * Ensures any Container, array of Containers, or even HTML or HTML[] are all
 * normalized down to just HTML.
 */
export function toHtml<D extends ContainerOrHtml | ContainerOrHtml[] | null>(node: D): HTML {
  if (node === null)
    return ''

  const n = (!Array.isArray(node) ? [node] : node) as ContainerOrHtml[]
  try {
    const results = n.map((i) => {
      const convert = solveForNodeType()
        .outputType<HTML>()
        .solver({
          html: h => h,
          text: t => t.textContent,
          element: e => e.outerHTML,
          node: (ne) => {
            if (isElement(ne))
              convert(ne)
            if (isTextNode(ne))
              convert(ne)

            throw new Error(
              `Unknown node type detected while converting to HTML: [ name: ${ne.nodeName}, type: ${ne.nodeType}, value: ${ne.nodeValue} ]`,
            )
          },
          document: d => `<html>${d.head.hasChildNodes() ? d.head.outerHTML : ''}${d.body.outerHTML}</html>`,
          fragment: (f) => {
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
      throw new HappyMishap(`Problem converting an array of ${n.length} nodes [${n.map(i => getNodeType(i as any)).join(', ')}] to HTML`, { name: 'toHTML([...])', inspect: ['first node', node[0]], error: e })

    else
      throw new HappyMishap(`Problem converting "${getNodeType(node)}" to HTML!`, { name: 'toHTML(getNodeType(node))', inspect: node, error: e })
  }
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
      document: (d) => {
        return createDocument(d.body.innerHTML, d.head.innerHTML)
      },
      element: e => pipe(e, toHtml, createElement),
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

import { createFragment } from './create'
import { describeNode, inspect } from './diagnostics'
import { HappyMishap } from './errors'
import type { HTML, MapCallback, NodeSelector, UpdateCallback, UpdateCallback_Native } from './happy-types'
import { getChildElements } from './nodes'
import { isDocument, isElement, isElementLike, isFragment } from './type-guards'
import { clone, getNodeType, toHtml } from './utils'
import type { Document, Fragment, IElement, INode, IText } from './index'

/**
 * Allows the _selection_ of HTML or a container type which is
 * then wrapped and a helpful query and mutation API is provided
 * to work with this DOM element.
 */
export const select = <D extends Document | Fragment | IElement | HTML>(node: D) => {
  const originIsHtml = typeof node === 'string'
  const rootNode: Document | Fragment | IElement = originIsHtml
    ? createFragment(node)
    : isElement(node)
      ? node as IElement
      : isDocument(node) || isFragment(node)
        ? node
        : undefined as never

  if (!rootNode)
    throw new HappyMishap(`Attempt to select() an invalid node type: ${getNodeType(node)}`, { name: 'select(INode)', inspect: node })

  type T = undefined extends D ? Fragment : D extends string ? 'html' : D
  const api: NodeSelector<T> = {
    type: () => {
      return originIsHtml
        ? 'html'
        : getNodeType(rootNode)
    },

    findAll: <S extends string | undefined>(sel: S) => {
      return sel
        ? rootNode.querySelectorAll(sel) as IElement[]
        : getChildElements(rootNode)
    },

    findFirst: <E extends string | undefined>(
      sel: string,
      errorMsg?: E): undefined extends E ? IElement | null : IElement => {
      const result = rootNode.querySelector(sel) as IElement | null
      if (!result && errorMsg)
        throw new HappyMishap(`${errorMsg}.\n\nThe HTML from the selected DOM node is:\n${toHtml(rootNode)}`, { name: 'select.findFirst()', inspect: rootNode })

      return result as undefined extends E ? IElement | null : IElement
    },

    append: (content: (IText | IElement | HTML | undefined) | (IText | IElement | HTML | undefined)[]) => {
      if (!content)
        return api

      const nodes = !Array.isArray(content) ? [content] : content.filter(i => i) as (INode | HTML)[]
      rootNode.append(...nodes)

      return api
    },

    /**
     * Queries for the DOM node which matches the first DOM
     * node within the DOM tree which was selected and provides
     * a callback you can add to mutate this node.
     *
     * If no selector is provided, the root selection is used as the element
     * to update.
     *
     * Note: by default if the query selection doesn't resolve any nodes then
     * this is a no-op but you can optionally express that you'd like it to
     * throw an error by setting "errorIfFound" to `true` or as a string if
     * you want to state the error message.
     */
    update: (
      selection?: string,
      errorIfNotFound: boolean | string = false,
    ) => <CB extends UpdateCallback>(
      mutate: CB,
    ): NodeSelector<T> => {
      const el = selection
        ? rootNode?.querySelector(selection) as IElement | null
        : isElement(rootNode)
          ? rootNode
          : rootNode.firstElementChild
            ? rootNode.firstElementChild
            : null

      if (el) {
        let elReplacement: IElement | false
        try {
          elReplacement = (mutate as unknown as UpdateCallback_Native)(el, 0, 1)
        }
        catch (e) {
          throw new HappyMishap(`update(): the passed in callback to select(container).update('${selection}')():  \n\n\tmutate(${describeNode(el)}, 0, 1)\n\n${e instanceof Error ? e.message : String(e)}.`, { name: `select(${typeof rootNode}).updateAll(${selection})(mutation fn)`, inspect: el })
        }

        if (elReplacement === false)
          el.remove()
        else if (!isElement(elReplacement))
          throw new HappyMishap(`The return value for a call to select(${getNodeType(rootNode)}).update(${selection}) return an invalid value! Value return values are an IElement or false.`, { name: 'select.update', inspect: el })
      }
      else {
        if (errorIfNotFound) {
          throw new HappyMishap(errorIfNotFound === true
            ? `The selection "${selection}" was not found so the update() operation wasn't able to be run`
            : errorIfNotFound,
          {
            name: `select(${selection}).update(sel)`,
            inspect: ['parent node', rootNode],
          })
        }

        if (!selection)
          throw new HappyMishap(`Call to select(container).update() was intended to target the root node of the selection but nothing was selected! This shouldn\'t really happen ... the rootNode\'s type is ${typeof rootNode}${typeof rootNode === 'object' ? `, ${getNodeType(rootNode)} [element-like: ${isElementLike(rootNode)}, element: ${isElement(rootNode)}, children: ${rootNode.childNodes.length}]` : ''}`)
      }

      return api
    },

    /**
     * mutate _all_ nodes with given selector; if no selector provided then
     * all child nodes will be selected.
     *
     * Note: when passing in a selector you will get based on the DOM query but
     * if nothing is passed in then you'll get the array of `IElement` nodes which
     * are direct descendants of the root selector.
     */
    updateAll: <S extends string | undefined>(
      selection?: S,
    ) => <CB extends UpdateCallback>(
      mutate: CB,
    ): NodeSelector<T> => {
      /**
        * The array of DOM nodes which have been selected.
        */
      const elements: IElement[] = (
        selection
          ? rootNode.querySelectorAll(selection)
          : getChildElements(rootNode)
      ) as IElement[]

      elements.forEach((el, idx) => {
        if (isElement(el)) {
          let elReplacement: IElement | false
          try {
            elReplacement = (mutate as unknown as UpdateCallback_Native)(el, idx, elements.length)
          }
          catch (e) {
            throw new HappyMishap(`updateAll(): the passed in callback to select(container).updateAll('${selection}')():  \n\n\tmutate(${describeNode(el)}, ${idx} idx, ${elements.length} elements)\n\n${e instanceof Error ? e.message : String(e)}.`, { name: `select(${typeof rootNode}).updateAll(${selection})(mutation fn)`, inspect: el })
          }
          // an explicit `false` return indicates the intent to remove
          if (elReplacement === false)
            el.remove()
          // an element returned is the expected return but if not then throw an error
          else if (!isElement(elReplacement))
            throw new HappyMishap(`The return value from the "select(container).updateAll('${selection}')(${describeNode(el)}, ${idx} idx, ${elements.length} elements)" call was invalid! Valid return values are FALSE or an IElement but instead got: ${typeof elReplacement}.`, { name: 'select().updateAll -> invalid return value' })
        }
        else {
          throw new Error(`Ran into an unknown node type while running updateAll(): ${JSON.stringify(inspect(el), null, 2)}`)
        }
      })

      return api
    },

    /**
     * Maps over all IElement's which match the selection criteria (or all child
     * elements if no selection provided) and provides a callback hook which allows
     * a mutation to any data structure the caller wants.
     *
     * This method is non-destructive to the parent selection captured with the
     * call to `select(dom)` and returns the map results to the caller instead of
     * continuing the selection API surface.
     */
    mapAll: <S extends string | undefined>(selection?: S) =>
      <M extends MapCallback<IElement, any>>(mutate: M) => {
        const collection: ReturnType<M>[] = []
        const elements: IElement[] = selection
          ? rootNode.querySelectorAll(selection)
          : getChildElements(rootNode)

        elements.forEach(el =>
          collection.push(mutate(clone(el))),
        )

        return collection
      },

    /**
     * Filters out `IElement` nodes out of the selected DOM tree which match
     * a particular DOM query. Also allows passing in an optional callback to
     * receive elements which were filtered out
     */
    filterAll: <S extends string>(selection: S, cb?: ((removed: IElement) => void)) => {
      rootNode?.querySelectorAll(selection).forEach((el) => {
        if (cb)
          cb(el)
        el.remove()
      })

      return api
    },

    toContainer: () => {
      return (
        originIsHtml
          ? toHtml(rootNode)
          : rootNode
      ) as undefined extends T
        ? Fragment
        : T extends 'html'
          ? string
          : T
    },
  }

  return api
}

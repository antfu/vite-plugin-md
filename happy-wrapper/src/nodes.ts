import { pipe } from 'fp-ts/lib/function'
import { HappyMishap } from './errors'
import { createDocument, createElement, createFragment, createNode } from './create'
import type { Container, ContainerOrHtml, DocRoot, HTML, UpdateSignature } from './happy-types'
import { isDocument, isElement, isElementLike, isFragment, isTextNode, isTextNodeLike, isUpdateSignature } from './type-guards'
import { clone, getNodeType, solveForNodeType, toHtml } from './utils'
import type { Document, Fragment, IElement, IText } from './index'

/**
 * converts a IHTMLCollection or a INodeList to an array
 */
export const getChildren = (el: Container): (IElement | IText)[] => {
  if (!el.hasChildNodes())
    return []

  const output: (IElement | IText)[] = []
  let child = el.firstChild as IElement | IText

  for (let idx = 0; idx < el.childNodes.length; idx++) {
    if (isElement(child) || isTextNode(child))
      output.push(child)
    else if (isFragment(child) || isDocument(child))
      getChildren(child).forEach(fragChild => output.push(fragChild))

    else
      throw new HappyMishap(`unknown node type [${getNodeType(child)}] found while trying to convert children to an array`, { name: 'getChildrenAsArray', inspect: child })

    child = child.nextSibling as IElement | IText
  }

  return output
}

export const getChildElements = (el: Container): IElement[] => {
  return getChildren(el).filter(c => isElement(c)) as IElement[]
}

/**
 * Extracts a node from a DOM tree; is designed to be used with `update/updateAll()`
 * and the `updateChildren()` utilities. It can remove a set of elements as well as retain the extracted elements in
 * an array of nodes.
 * ```
 * const memory = []
 * domTree = select(domTree)
 *  .updateAll('.bad-juju')(extract(memory))
 *  .toContainer()
 * ```
 */
export const extract = <M extends (IElement | IText) | IElement | undefined>(memory?: M[]) => <T extends IElement extends M
  ? IElement
  : IElement | IText>(node: T): false => {
  if (memory)
    memory.push(clone(node) as T & M)
  return false // indicates that node passed in should be removed
}

/**
 * Replaces an existing element with a brand new one while preserving the element's
 * relationship to the parent node (if one exists).
 */
export const replaceElement = (newElement: IElement | HTML) => (oldElement: IElement): IElement => {
  const parent = oldElement.parentElement
  if (isElement(parent) || isTextNode(parent))
    parent.replaceChild(createElement(newElement), oldElement)

  const newEl = typeof newElement === 'string' ? createElement(newElement) : newElement

  if (parent) {
    const children = getChildElements(parent)
    const childIdx = children.findIndex(c => toHtml(c) === toHtml(oldElement))
    // match on first child index which produces the same HTML output
    const updated: IElement[] = (children || []).map((c, i) => i === childIdx
      ? newEl
      : c,
    )
    parent.replaceChildren(...updated)
  }
  return newEl
}

/**
 * Appends one or more nodes to a parent container
 */
export const append = <N extends ContainerOrHtml[]>(...nodes: N | N[]) => {
  const n = nodes.flat()
  return <P extends UpdateSignature | ContainerOrHtml>(parent: P): P extends Array<any> ? IElement : P => {
    const result = solveForNodeType('text', 'node').mirror().solver({
      html: h => pipe(h, createElement, append(...nodes), toHtml),
      element: (e) => {
        n.forEach(i => e.append(i))
        return e
      },
      fragment: (f) => {
        n.forEach(i => f.append(i))
        return f
      },
      document: (d) => {
        n.forEach(i => d.body.append(i))
        return d
      },

    })(isUpdateSignature(parent) ? parent[0] : parent)

    return result as P extends Array<any> ? IElement : P
  }
}

/**
 * A _partially applied_ instance of the `into()` utility; currently waiting
 * for child/children nodes.
 *
 * Note: the return type of this function is the Parent node (in whatever)
 * container type was passed in. However, child element(s) being wrapped which
 * had reference to a parent node, will have their parent node updated to
 * point now to the new parent node instead. This is important for proper
 * mutation when using the update/updateAll() utilities.
 */
export type IntoChildren<P extends DocRoot | IElement | HTML | undefined> =
  <A extends UpdateSignature | ContainerOrHtml[] | ContainerOrHtml[][]>(
    ...args: A
  ) => A extends UpdateSignature
    ? IElement | false
    : undefined extends P
      ? Fragment
      : P

/**
 * A higher order function which starts by receiving a _wrapper_ component
 * and then is fully applied when the child nodes are passed in.
 *
 * This is the _inverse_ of the **wrap()** utility.
 *
 * ```ts
 * const sandwich = into(bread)(peanut, butter, jelly)
 * ```
 */
export const into = <P extends DocRoot | IElement | HTML | undefined>(
  /** The parent container which will wrap the child content */
  parent?: P,
): IntoChildren<P> =>
    <C extends UpdateSignature | ContainerOrHtml[] | ContainerOrHtml[][]>(
      ...content: C
    ): C extends UpdateSignature ? IElement | false : undefined extends P ? Fragment : P => {
    /**
     * Keeps track of whether the incoming parent was wrapped in a temporary
     * document fragment.
     */
      const wrapped = !!(typeof parent === 'string')

      /**
       * Upgrade HTML or undefined values for parent to ensure
       * that no matter what's passed in, the parent is some sort
       * valid container
       */
      let normalizedParent: DocRoot | IElement = wrapped
        ? createFragment(parent)
        : isElement(parent)
          ? parent
          : !parent
              ? createFragment()
              : parent

      // flatten children passed in to support both arrays and destructed arrays
      const flat = isUpdateSignature(content)
        ? [content[0]] // first element is what's being used; discard index and count
        : content.flatMap(c => c as Container | string)

      if (isTextNodeLike(normalizedParent)) {
        throw new HappyMishap(
          `The wrapper node -- when calling into() -- is wrapping a text node; this is not allowed. Parent HTML: "${toHtml(normalizedParent)}"`, {
            name: 'into()',
            inspect: [
              ['parent node', parent],
            ],
          },
        )
      }

      const contentHtml = flat.map(c => toHtml(c)).join('')
      const transient = createFragment(contentHtml)
      const parentHasChildElements = normalizedParent.childElementCount > 0

      if (parentHasChildElements)
        getChildren(transient).forEach(c => normalizedParent.firstChild.appendChild(clone(c)))
      else
        getChildren(transient).forEach(c => normalizedParent.append(c))

      // if this call was made as part of an update operation we'll return
      // the parent as an IElement (even if it was wrapped in a fragment)
      // and make sure that the element passed in is replaced with the parent
      if (isUpdateSignature(content)) {
        if (isElement(content[0])) {
          normalizedParent = isElementLike(normalizedParent) ? normalizedParent.firstElementChild : createElement(normalizedParent)

          content[0].replaceWith(normalizedParent)
        }
      }

      return (wrapped && !isUpdateSignature(content)
        ? toHtml(normalizedParent)
        : normalizedParent) as C extends UpdateSignature ? IElement | false : undefined extends P ? Fragment : P
    }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ChangeTagNameTo<T extends string> = <E extends [IElement | HTML | Document | Fragment] | UpdateSignature>(...el: E) => E extends UpdateSignature ? IElement : E

/**
 * Changes the tag name for the top level container element passed in
 * while preserving the parent node relationship.
 * ```ts
 * // <div>hi</div>
 * const html = changeTagName('div')(`<span>hi</span`)
 * ```
 */
export const changeTagName = <T extends string>(
  tagName: T,
): ChangeTagNameTo<T> => <A extends [IElement | HTML | Document | Fragment] | UpdateSignature>(
    ...args: A
  ): A extends UpdateSignature ? IElement : A => {
  const node = args[0]
  /** uses regex to modify tag name to new value */
  const replacer = (el: IElement, tagName: string) => {
    const open = new RegExp(`^<${el.tagName.toLowerCase()}`)
    const close = new RegExp(`<\/${el.tagName.toLowerCase()}>$`)

    const newTag = toHtml(el)
      .replace(open, `<${tagName}`)
      .replace(close, `</${tagName}>`)
    if (el.parentNode && el.parentNode !== null)
      el.parentNode.replaceChild(createNode(newTag), el)

    return newTag
  }

  const areTheSame = (before: string, after: string) =>
    before.toLocaleLowerCase() === after.toLocaleLowerCase()

  return solveForNodeType()
    .mirror()
    .solver({
      html: (h) => {
        const before = createFragment(h).firstElementChild.tagName
        return areTheSame(before, tagName)
          ? h
          : toHtml(replacer(createFragment(h).firstElementChild, tagName))
      },
      text: (t) => {
        throw new HappyMishap('Attempt to change a tag name for a IText node. This is not allowed.', { inspect: t, name: 'changeTagName(IText)' })
      },
      node: (n) => {
        throw new HappyMishap('Attempt to change a generic INode node\'s tag name. This is not allowed.', { inspect: n, name: 'changeTagName(INode)' })
      },
      element: el => areTheSame(el.tagName, tagName)
        ? el
        : replaceElement(replacer(el, tagName))(el),

      fragment: (f) => {
        if (f.firstElementChild)
          f.firstElementChild.replaceWith(changeTagName(tagName)(f.firstElementChild))

        else
          throw new HappyMishap('Fragment passed into changeTagName() has no elements as children!', { name: 'changeTagName(Fragment)', inspect: f })

        return f
      },
      document: (d) => {
        d.body.firstElementChild.replaceWith(
          changeTagName(tagName)(d.body.firstElementChild),
        )
        const body = toHtml(d.body)
        const head = d.head.innerHTML

        return createDocument(body, head)
      },
    })(node) as A extends UpdateSignature ? IElement : A
}

/**
 * Prepends an `IElement` as the first child element of a host element.
 *
 * Note: you can use a string representation of an element
 * ```ts
 * const startWith = prepend('<h1>just do it</h1>')
 * const message: IElement = startWith(body)
 * ```
 */
export const prepend = (prepend: IElement | IText | HTML) => (el: IElement): IElement => {
  const p = typeof prepend === 'string'
    ? createFragment(prepend).firstChild
    : prepend

  el.prepend(p)
  return el
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Before<_T extends ContainerOrHtml> = <A extends [IElement | HTML | Document | Fragment] | UpdateSignature>(
    ...afterNode: A
  ) => A extends UpdateSignature ? IElement : A extends string ? string : A

/**
 * Inserts a set of Node or string objects in the children list of this Element's
 * parent, just before this Element. String objects are inserted as equivalent Text nodes.
 *
 * Note: you can use a string representation of an element
 * ```ts
 * const startWith = before('<h1>just do it</h1>')
 * const message: IElement = startWith(body)
 * ```
 */
export const before = <B extends ContainerOrHtml>(
  beforeNode: B,
): Before<B> => <A extends [IElement | HTML | Document | Fragment] | UpdateSignature>(
    ...afterNode: A
  ): A extends UpdateSignature ? IElement : A extends string ? string : A => {
  const outputIsHtml = (typeof afterNode[0] === 'string')
  const beforeNormalized: IElement | IText = typeof beforeNode === 'string'
    ? (createFragment(beforeNode).firstElementChild || createFragment(beforeNode).firstChild) as IElement | IText
    : createNode(beforeNode)

  const afterNormalized: ContainerOrHtml = typeof afterNode[0] === 'string'
    ? createFragment(afterNode[0])
    : isUpdateSignature(afterNode[0])
      ? afterNode[0][0]
      : afterNode[0]

  const invalidType = (n: string | Container) => {
    throw new HappyMishap(
    `The before() utility was passed an invalid container type for the "after" node: ${getNodeType(n)}`,
    { name: `before(${getNodeType(beforeNormalized)})(${getNodeType(n)})`, inspect: n },
    )
  }

  const noParent = (n: string | Container) =>
    new HappyMishap(
      'the before() utility for depends on having a parent element in the "afterNode" as the parent\'s value must be mutated. If you do genuinely want this behavior then use a Fragment (or just HTML strings)',
      { name: `before(${getNodeType(beforeNode)})(${getNodeType(n)})` },
    )

  const node = solveForNodeType()
    .mirror()
    .solver({
      html: h => pipe(h, createFragment, before(beforeNode), toHtml),
      text: (t) => {
        if (!t.parentElement)
          throw noParent(t)
        t.before(beforeNormalized)
        return t
      },
      node: n => invalidType(n),
      document: (d) => {
        d.body.prepend(beforeNormalized)
        return d
      },
      fragment: (f) => {
        f.prepend(beforeNormalized)
        return f
      },
      element: (el) => {
        if (el.parentElement) {
          // inject the node before this one (on parent)
          el.before(beforeNormalized)

          return el
        }
        else { throw noParent(el) }
      },
    })(afterNormalized)

  return (outputIsHtml && !isUpdateSignature(afterNode)
    ? toHtml(node)
    : node) as A extends UpdateSignature ? IElement: A extends string ? string :A
}

export const after = (
  afterNode: IElement | IText | HTML,
) => <B extends IElement | Fragment | HTML>(
  beforeNode: B,
): B => {
  const afterNormalized = typeof afterNode === 'string'
    ? createFragment(afterNode).firstElementChild
    : afterNode

  const invalidType = (n: string | Container) => {
    throw new HappyMishap(
    `The after function was passed an invalid container type: ${getNodeType(n)}`,
    { name: `after(${getNodeType(beforeNode)})(invalid)` },
    )
  }

  return solveForNodeType()
    .mirror()
    .solver({
      html: h => pipe(h, createFragment, after(afterNode), toHtml),
      text: t => invalidType(t),
      node: n => invalidType(n),
      document: (d) => {
        d.body.append(afterNormalized)
        return d
      },
      fragment: (f) => {
        f.append(afterNormalized)
        return f
      },
      element: (el) => {
        if (el.parentElement) {
          // inject the node before this one (on parent)
          el.after(afterNormalized)

          return el
        }
        else {
          throw new HappyMishap(
            'the after() utility for depends on having a parent element in the "afterNode" as the parent\'s value must be mutated. If you do genuinely want this behavior then use a Fragment (or just HTML strings)',
            { name: `after(${getNodeType(afterNode)})(IElement)` },
          )
        }
      },
    })(beforeNode)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ReadyForWrapper<C extends UpdateSignature | ContainerOrHtml[]> =
  <P extends DocRoot | IElement | HTML | undefined>(
    parent: P,
  ) => undefined extends P ? Fragment : P

/**
 * **wrap**
 *
 * A higher order function which receives child elements which will need
 * to be wrapped and then fully applied when it receives the singular _wrapper_
 * container.
 *
 * This is the _inverse_ of the **into()** utility.
 *
 * ```ts
 * const sandwich = wrap(peanut, butter, jelly)(bread)
 * ```
 */
export const wrap = <C extends UpdateSignature | ContainerOrHtml[]>(
  ...children: C
): ReadyForWrapper<C> => <P extends DocRoot | IElement | HTML | undefined>(
    parent?: P,
  ) => {
  return into(parent)(...children) as undefined extends P ? Fragment : P
}


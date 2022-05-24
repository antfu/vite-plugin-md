import type { getNodeType } from './utils'
import type { Document, Fragment, IElement, INode, IText } from './index'
export type InspectionTuple = [msg: string, item: unknown]

export type HTML = string

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type GetAttribute<T extends string> = <N extends Container | HTML>(node: N) => string

export type NodeTypeInput<T extends ReturnType<typeof getNodeType>> = T extends 'html'
  ? string
  : T extends 'text'
    ? IText
    : T extends 'element'
      ? IElement
      : T extends 'document'
        ? Document
        : T

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
            ? Fragment
            : unknown

export type DocRoot = Document | Fragment
export type DomNode = IElement | IText | INode
export type Container = DocRoot | DomNode
export type ContainerOrHtml = Container | HTML

/**
 * The select.update/updateAll methods not only receive the _element_
 * which is being mutated but also the _index_ and _total count_ of selection
 * results.
 */
export type UpdateSignature = [el: IElement, idx: number, total: number] | [el: IElement, idx: number] | [el: IElement]

export interface ToHtmlOptions {
  pretty?: boolean
  indent?: number
}

export interface TreeSummary {
  node: string
  children: TreeSummary[]
}

export interface Tree {
  node: Container
  type: string
  level: number
  summary: () => TreeSummary
  toString: () => string

  children: Tree[]
}

/**
 * A callback which receives a node type `C` and allows side-effects and/or
 * mutation. It expects the same container structure -- mutation or not -- to
 * be passed back as a return value. The one exception is that if you pass back
 * a `false` value then the element will be removed.
 */
export type UpdateCallback_Native = (el: IElement, idx: number, total: number) => IElement | false

export type UpdateCallback = (el: IElement, idx: number, total: number) => IElement | false

export type MapCallback<I, O> = (input: I) => O

export interface NodeSolverDict<O> {
  html: (input: HTML) => O extends 'mirror' ? HTML : O
  text: (input: IText) => O extends 'mirror' ? IText : O
  element: (input: IElement, parent?: IElement | DocRoot) => O extends 'mirror' ? IElement : O
  node: (input: INode) => O extends 'mirror' ? INode : O
  document: (input: Document) => O extends 'mirror' ? Document : O
  fragment: (input: Fragment) => O extends 'mirror' ? Fragment : O
}

/**
 * A fully configured solver which is ready to convert a node into type `O`; if `O` is never
 * then it will mirror the input type as the output type
 */
export type NodeSolverReady<E extends NodeType, O> = <N extends Exclude<Container | HTML | null, E>>(node: N, parent?: IElement | DocRoot) => O extends 'mirror'
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

/**
 * Allows you to setup a type-string utility which receives DOM containers
 * and returns either the same container type or a specific type.
 *
 * This uses a builder API, of which this is the first step.
 */
export type NodeSolver = <E extends NodeType = never>(...exclude: E[]) => NodeSolverWithExclusions<E>

/**
 * A selector API provided by using the `select()` utility
 */
export interface NodeSelector<T extends Container | 'html'> {
  /**
   * The _type_ of the root node
   */
  type: () => NodeType
  /**
   * Find the first `IElement` found using the selector string.
   *
   * Note: _by default the return type includes `null` if no results were found but if you
   * prefer to throw an error you can state the error text and an error will be thrown_
   */
  findFirst: <E extends string | undefined>(sel: string, errorMsg?: E) => undefined extends E
    ? IElement | null
    : IElement
  /**
   * Find _all_ `IElement` results returned from the Selection query
   */
  findAll: <S extends string | undefined>(sel: S) => IElement[]

  /**
   * Appends one or more elements to the root selected node
   */
  append: (content?: (IText | IElement | HTML | undefined) | (IText | IElement | HTML | undefined)[]) => NodeSelector<T>

  /**
   * Allows the injection of a callback which will be used to mutate on the first `IElement` node
   * which matches the first
   */
  update: <E extends string | boolean>(sel?: string, errorMsg?: E) => <CB extends UpdateCallback>(cb: CB) => NodeSelector<T>
  /**
   * Provides a way to inject an update callback which will be applied to all IElement nodes
   * which meet the selector query. If no query is provided, then this will be all `IElement`
   * children of the root node.
   */
  updateAll: <S extends string | undefined>(sel?: S) => <CB extends UpdateCallback>(cb: CB) => NodeSelector<T>

  /**
   * Map over all selected items and transform them as needed; results are returned to
   * caller (exiting the selection API) and operation does not mutate the parent
   * selected DOM tree.
   */
  mapAll: <S extends string | undefined>(selection?: S) => <O, M extends MapCallback<IElement, O>>(mutate: M) => O[]

  /**
   * Filters out all nodes which match the DOM query selector and returns the
   * selector API
   */
  filterAll: <S extends string>(selection: S) => NodeSelector<T>

  /**
   * Returns the root node with all mutations included
   */
  toContainer: () => undefined extends T
    ? Fragment
    : T extends 'html'
      ? string
      : T
}


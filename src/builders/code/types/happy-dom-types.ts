import type { Document, DocumentFragment, IElement, INode, IText } from 'happy-dom'
import type { NodeType } from '../utils/happyDom'
import type { HTML } from './code-types'

export type DocRoot = Document | DocumentFragment
export type DomNode = IElement | IText | INode
export type Container = DocRoot | DomNode

export interface ToHtmlOptions {
  pretty?: boolean
  indent?: number
}

export type FragWrapper = DocumentFragment
export interface BeforeAfterWrapper {
  /** put on the immediate interior of a tag */
  open?: string
  /**
   * a text node _prepended_ before the element
   */
  before?: string
  /** put before the closing tag */
  close?: string
  /**
   * A text node _appended_ after the closing tag
   */
  after?: string
  /**
   * Provides tab/space indentation based on the nesting level
   * of the element
   */
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

export type UpdateCallback<T extends Container> = (e: T, idx: number, total: number) => T

export interface NodeSolverDict<O> {
  html: (input: HTML) => O extends 'mirror' ? HTML : O
  text: (input: IText) => O extends 'mirror' ? IText : O
  element: (input: IElement, parent?: IElement | DocRoot) => O extends 'mirror' ? IElement : O
  node: (input: INode) => O extends 'mirror' ? INode : O
  document: (input: Document) => O extends 'mirror' ? Document : O
  fragment: (input: DocumentFragment) => O extends 'mirror' ? DocumentFragment : O
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

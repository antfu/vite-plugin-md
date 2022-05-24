import { identity } from 'fp-ts/lib/function'
import { Text, Window } from 'happy-dom'
import { dasherize } from 'native-dash'
import { HappyMishap } from './errors'
import type { Container, HTML } from './happy-types'
import { isElement, isElementLike, isTextNodeLike } from './type-guards'
import { clone, solveForNodeType, toHtml } from './utils'
import type { Document, Fragment, IElement, IText } from './index'

/**
 * Converts an HTML string into a Happy DOM document tree
 */
export function createDocument(body: string, head?: string): Document {
  const window = new Window()
  const document = window.document
  document.body.innerHTML = body
  if (head)
    document.head.innerHTML = head
  return document
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FragmentFrom<_T extends Container | 'html'> = Fragment

export function createFragment<C extends Container | HTML>(content?: C): FragmentFrom<C extends string ? 'html' : Fragment> {
  const window = new Window()
  const document = window.document
  const fragment = document.createDocumentFragment() as Fragment
  if (content)
    fragment.append(clone(content))

  return fragment as FragmentFrom<C extends string ? 'html' : Fragment>
}

/**
 * Creates a DOM Node which will be either an `IElement` or `IText` node
 * based on the content passed in.
 */
export const createNode = (node: Container | string): IElement | IText => {
  const frag = createFragment(node)
  if (isElementLike(frag))
    return frag.firstElementChild as IElement
  else if (isTextNodeLike(frag))
    return frag.firstChild as IText
  else
    throw new HappyMishap('call to createNode() couldn\'t be converted to IElement or IText node', { name: 'createNode()', inspect: node })
}

/**
 * Creates a IText Node
 */
export function createTextNode(text?: string): IText {
  if (!text) {
    console.warn('An empty string was passed into createTextNode(); will be ignored but probably a mistake')
    return new Text('')
  }

  const frag = createFragment(text)
  if (isTextNodeLike(frag))
    return frag.firstChild as unknown as IText
  else
    throw new HappyMishap(`The HTML passed in cannot be converted to a single text node: "${text}".`, { name: 'createFragment(text)', inspect: frag })
}

/**
 * Creates an element node and can preserve parent relationship if known
 */
export const createElement = (el: Container | HTML, parent?: IElement): IElement => solveForNodeType()
  .outputType<IElement>()
  .solver({
    node: (n) => {
      if (isElement(n))
        return createElement(n) as IElement
      else
        throw new HappyMishap('can\'t create an IElement from an INode node because it doesn\'t have a tagName property', { inspect: n })
    },
    html: (h) => {
      const frag = createFragment(h)
      if (isElementLike(frag)) {
        if (parent) {
          parent.append(frag.firstElementChild)
          return parent?.lastElementChild
        }

        return frag.firstElementChild
      }
      else { throw new HappyMishap('The HTML passed into createElement() is not convertible to a IElement node!', { name: 'createElement(html)', inspect: frag }) }
    },
    element: identity,
    text: (t) => {
      throw new HappyMishap('An IElement can not be created from a IText node because element\'s require a wrapping tag name!', { name: 'createElement(text)', inspect: t })
    },
    fragment: (f) => {
      if (isElement(f.firstElementChild))
        return f.firstElementChild as IElement

      else
        throw new HappyMishap(`Unable to create a IElement node from: \n\n${toHtml(f)}`, { name: 'createElement()' })
    },
    document: (d) => {
      if (isElementLike(d)) {
        if (parent)
          throw new HappyMishap('A Document and a parent IElement were passed into createElement. This is not a valid combination!')

        return d.firstElementChild
      }

      else { throw new HappyMishap('Can not create an Element from passed in Document', { name: 'createElement(document)', inspect: d }) }
    },
  })(el)

export interface CssVariable {
  prop: string
  value: string | number | boolean
}

export type ClassDefn = Record<string, string | boolean | number>
export type MultiClassDefn = [selector: string, keyValues: ClassDefn][]

export interface ClassApi {
  /** add a child selector */
  addChild: (selector: string, defn: ClassDefn) => ClassApi
  /** add CSS prop/values */
  addProps: (defn: ClassDefn) => ClassApi
}

export interface InlineStyle {
  /** add a single CSS variable (at a time); the CSS scope will ':root' unless specified */
  addCssVariable: (prop: string, value: string | number | boolean, scope?: string) => InlineStyle
  addClassDefinition: (selection: string, cb: ((api: ClassApi) => void)) => InlineStyle
  addCssVariables: (dictionary: Record<string, string>, scope?: string) => InlineStyle
  convertToVueStyleBlock: (lang: 'css' | 'scss', scoped: boolean) => InlineStyle

  finish: () => IElement
}

const renderClasses = (klasses: MultiClassDefn) => {
  return klasses.map(
    ([selector, defn]) => `\n\n  ${selector} {\n${Object.keys(defn).map(
      p => `    ${dasherize(p)}: ${defn[p]};`,
    ).join('\n')}\n  }`).join('\n')
}

/**
 * Creates a new `<style>...</style>` node and provides a simple API surface to allow
 * populating the contents with inline CSS content
 */
export const createInlineStyle = <T extends string = 'text/css'>(type: T = 'text/css' as T) => {
  const cssVariables: Record<string, CssVariable[]> = {}
  const cssClasses: MultiClassDefn = []
  let isVueBlock = false
  let isScoped = true
  let vueLang: 'css' | 'scss' = 'css'

  const api: InlineStyle = {
    addCssVariable(prop: string, value: string | number | boolean, scope = ':root') {
      if (!(scope in cssVariables))
        cssVariables[scope] = []
      cssVariables[scope].push({ prop: prop.replace(/^--/, ''), value })

      return api
    },
    addClassDefinition(selector, cb) {
      const classApi: ClassApi = {
        addChild: (child, defn) => {
          const childSelector = `${selector} ${child}`
          cssClasses.push([childSelector, defn])
          return classApi
        },
        addProps: (defn) => {
          cssClasses.push([selector, defn])
          return classApi
        },
      }
      cb(classApi)
      return api
    },
    addCssVariables(dictionary: Record<string, string | number | boolean>, scope = ':root') {
      Object.keys(dictionary).forEach(p => api.addCssVariable(p, dictionary[p], scope))

      return api
    },
    convertToVueStyleBlock(lang, scoped = true) {
      vueLang = lang
      isVueBlock = true
      isScoped = scoped

      return api
    },

    finish() {
      const setVariable = (scope: string, defn: Record<string, any>) => `${scope} {\n${Object.keys(defn).map(prop => `    --${defn[prop].prop}: ${defn[prop].value}${String(defn.prop).endsWith(';') ? '' : ';'}`).join('\n')}\n  }`

      let text = ''
      // variables
      Object.keys(cssVariables).forEach(
        (v) => {
          text = `${text}${setVariable(v, cssVariables[v])}\n`
        },
      )
      // classes
      text = `${text}${renderClasses(cssClasses)}`

      return isVueBlock
        ? createElement(`<style lang="${vueLang}"${isScoped ? ' scoped' : ''}>\n${text}\n</style>`)
        : createElement(`<style type="${type}">\n${text}\n</style>`)
    },
  }

  return api
}

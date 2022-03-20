import type { LinkElement } from '../../@types/core'
import type { WithTagAndBase } from './md-link'

/**
 * A callback function which is passed a name/value dictionary of
 * properties on a link tag and expects these inputs to be converted
 * to a similarly structured response before the Markdown is rendered
 * to HTML.
 */
export type LinkTransformer = (link: WithTagAndBase<LinkElement>) => WithTagAndBase<LinkElement>

/**
 * a callback function which is provided a Link's key/value
 * pairs as context and expects a string based response
 */
export type StringTransformer = (meta: LinkElement) => string

export interface LinkifyConfig {
  /**
   * The relative path to the root of your markdown content; if you're using
   * the `vite-plugin-pages` plugin this would typically be "src/pages" but is
   * configurable.
   *
   * @default "src/pages"
   */
  rootDir: string
  /**
   * the class to add to links which are external to the hosting site
   *
   * @default "external-link"
   */
  externalLinkClass: undefined | string | StringTransformer

  /**
   * the class to add to links which are the same as the hosting site
   *
   * @default "internal-link"
   */
  internalLinkClass: undefined | string | StringTransformer

  /**
   * the class to add to links which internal and _relative_ to the current route
   *
   * @default undefined
   */
  relativeLinkClass: undefined | string | StringTransformer

  /**
 * the class to add to links which are internal but _fully qualified_ (aka, not relative)
 *
 * @default undefined
 */
  fullyQualifiedLinkClass: undefined | string | StringTransformer

  /**
 * the class to add to links which using VueJS router to navigate
 *
 * @default "router-link"
 */
  routerLinkClass: undefined | string | StringTransformer

  /**
   * the class to add to links are an anchor link to somewhere on
   * the same page (e.g., links starting as `#something`)
   *
   * @default "anchor-tag"
   */
  anchorTagClass: undefined | string | StringTransformer

  /**
   * the class to add to _external_ links which refer to an "http"
   * (aka, non-TLS) base resource.
   *
   * @default "insecure"
   */
  insecureClass: undefined | string | StringTransformer

  /**
   * the class to add to _external_ links which uses a "file" instead
   * of "https" protocol reference.
   *
   * @default "file-link"
   */
  fileClass: undefined | string | StringTransformer

  /**
   * the class to add to _external_ links which refers to a
   * "mailto:" based URI resource.
   *
   * @default "mailto-link"
   */
  mailtoClass: undefined | string | StringTransformer

  /**
   * the class to add to any link which points to an image directly
   *
   * @default "image-reference"
   */
  imageClass: undefined | string | StringTransformer

  /**
   * the class to add to any link which points to a known document
   * type (e.g., `.doc`, `.txt`, `.xls`, `.pdf`, etc.).
   *
   * @default "doc-reference"
   */
  documentClass: undefined | string | StringTransformer

  /**
   * a tuple which defines both a RegEx rule/pattern and a resultant **class** string which
   * is applied if the rule tests positive
   */
  ruleBasedClasses: [rule: RegExp, klass: string][]

  /**
   * allows you to specify what `target` property external links
   * will be openned up in.
   *
   * @default "_blank"
   */
  externalTarget: undefined | string | StringTransformer
  /**
   * the `rel` property for external links
   *
   * @default "noreferrer noopenner"
   */
  externalRel: undefined | string | StringTransformer

  /**
   * allows you to specify what `target` property external links
   * will be openned up in.
   *
   * @default undefined
   */
  internalTarget: undefined | string | StringTransformer
  /**
   * the `rel` property for internal links
   *
   * @default undefined
   */
  internalRel: undefined | string | StringTransformer

  /**
   * if set to **true**, all internal `<a>` link tags will be converted to
   * `<router-link>` tags instead (and "href" converted to the "to" prop).
   * This plugin will also attempt to locate the containing app's import of
   * **vue-router** so that it may resolve relative paths.
   *
   * Alternatively you can pass in the `Router` API or if you have an alternative
   * router you can pass in a `Ref<string>` or `ComputedRef<string>` and it will
   * be evaluated at FINISH
   *
   * @default true
   */
  useRouterLinks: boolean

  /**
   * Allows for automatic removal of `index.md` and `index.html` in URL links
   * in favor of just using the route path for.
   *
   * Note: internal links only.
   *
   * @default true
   */
  cleanIndexRoutes: boolean

  /**
   * Allows for automatic removal of all file extensions found in internal
   * links with the assumption that the filename represents the last part
   * of the path.
   *
   * @default true
   */
  cleanAllRoutes: boolean

  /**
   * If you still want to modify these tags after all that's already happened,
   * feel free to hook into a callback where you will be given the results
   * to modify to your heart's content.
   *
   * @default undefined
   */
  postProcessing: LinkTransformer

}

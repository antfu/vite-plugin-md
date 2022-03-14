/* eslint-disable no-use-before-define */
import type MarkdownIt from 'markdown-it'
import type { FilterPattern } from '@rollup/pluginutils'
import type { Plugin, UserConfig } from 'vite'
import { WithExtras } from './builders/plugins/md-link'

export type ViteConfig = Parameters<Exclude<Plugin['configResolved'], undefined>>[0]

export interface SfcBlocks {
  /** the HTML template block of the SFC */
  html: string

  meta: ProcessedFrontmatter

  /** the _script_ blocks  */
  script: string
  /**
   * Any custom blocks which may exist on the page beyond
   * just "script" and "template"
   */
  customBlocks: string[]
  /**
   * After all processing, the component's definition is available as a string
   */
  component: string
}

/** a `<meta />` property in HTML is defined with the following name/values */
export interface MetaProperty {
  key?: string
  /**
   * the "name" property used by Facebook and other providers who
   * use the Opengraph standards
   */
  property?: string
  /**
   * used by google to identify the "name" of the name/value pair
   */
  itemprop?: string
  /**
   * used by Twitter to indicate the "name" field in a meta properties
   * name/value pairing
   */
  name?: string
  /**
   * The value of the meta property
   */
  content?: any
  [key: string]: unknown
}

export interface LinkElement {
  href?: string | undefined
  tagName?: string | undefined
  class?: string | undefined
  ref?: string | undefined
  target?: string | undefined
  to?: string | undefined
  [key: string]: unknown
}

/**
 * A callback function which is passed a name/value dictionary of
 * properties on a link tag and expects these inputs to be converted
 * to a similarly structured response before the Markdown is rendered
 * to HTML.
 */
export type LinkTransformer = (link: WithExtras<LinkElement>) => WithExtras<LinkElement>

/**
 * a callback function which is provided a Link's key/value
 * pairs as context and expects a string based response
 */
export type StringTransformer = (meta: LinkElement) => string

/**
 * Frontmatter content is represented as key/value dictionary
 */
export interface Frontmatter {
  title?: string
  name?: string
  description?: string
  meta?: MetaProperty[]
  [key: string]: unknown
}

/**
 * The key/value definition for Route Properties.
 *
 * Note: we know that "layout" is likely and a _string_
 * but all other props are possible.
 */
export interface RouteProperties {
  layout?: string
  [key: string]: unknown
}

/**
 * Options for Graymatter parser [[Docs](https://github.com/jonschlinkert/gray-matter#options)]
 */
export interface GraymatterOptions {
  /**
   * Extract an excerpt that directly follows front-matter, or is the
   * first thing in the string if no front-matter exists.
   *
   * If set to excerpt: true, it will look for the frontmatter delimiter,
   * --- by default and grab everything leading up to it.
   *
   * You can also set excerpt to a function. This function uses the 'file'
   * and 'options' that were initially passed to gray-matter as parameters,
   * so you can control how the excerpt is extracted from the content.
   */
  excerpt?: boolean | (() => string)

  /**
   * Define a custom separator to use for excerpts.
   */
  excerpt_separator?: string

  /**
   * Define custom engines for parsing and/or stringifying front-matter.
   *
   * Engines may either be an object with `parse` and (optionally) stringify
   * methods, or a function that will be used for parsing only.
   */
  engines?: Record<string, () => any>

  /**
   * Define the engine to use for parsing front-matter.
   *
   * ```ts
   * { language: 'toml' }
   * ```
   */
  language?: string

  /**
   * Open and close delimiters can be passed in as an array of strings.
   */
  delimiters?: string | [string, string]
}

export interface ProcessedFrontmatter {
  /**
   * non-meta props intended for the HEAD of the page
   */
  head: Record<string, any>
  /**
   * Meta properties intended for the HEAD of the page
   */
  metaProps: MetaProperty[]
  /**
   * The core metadata that a page contains
   */
  frontmatter: Frontmatter
  /**
   * a dictionary of key/values to that are intended to be associated with the route's
   * metadata.
   */
  routeMeta: RouteProperties
}

export interface Options {
  /**
   * Explicitly set the Vue version
   *
   * @default auto detected
   */
  vueVersion?: string

  /**
   * Enable head support, need to install @vueuse/head and register to App in main.js
   *
   * @default false
   */
  headEnabled?: boolean

  /**
   * The head field in frontmatter used to be used for @vueuse/head
   *
   * When an empty string is passed, it will use the root properties of the frontmatter
   *
   * @default ''
   */
  headField?: string

  /**
   * Parse for frontmatter
   *
   * @default true
   */
  frontmatter?: boolean

  /**
   * Parse for excerpt
   *
   * If `true`, it will be passed to `frontmatterPreprocess` as `frontmatter.excerpt`, replacing
   * the `excerpt` key in frontmatter, if there's any
   *
   * @default false
   */
  excerpt?: boolean

  /**
   * Remove custom SFC block
   *
   * @default ['route', 'i18n']
   */
  customSfcBlocks?: string[]

  /**
   * Custom function to provide defaults to the frontmatter and
   * move certain attributes into the "meta" category.
   *
   * Note: _overriding this will remove built-in functionality setting
   * "meta" properties and the built-in "head" support. Do this only
   * if you know what you're doing._
   */
  frontmatterPreprocess?: (
    frontmatter: Frontmatter,
    options: ResolvedOptions
  ) => ProcessedFrontmatter

  /**
   * Expose frontmatter via expose API
   *
   * @default true
   */
  exposeFrontmatter?: boolean

  /**
   * Expose excerpt via expose API
   *
   * @default false
   */
  exposeExcerpt?: boolean

  /**
   * Add `v-pre` to `<code>` tag to escape curly brackets interpolation
   *
   * @see https://github.com/antfu/vite-plugin-md/issues/14
   * @default true
   */
  escapeCodeTagInterpolation?: boolean

  /**
   * Options passed to Markdown It
   *
   * @default { html: true, linkify: true, typographer: true }
   */
  markdownItOptions?: MarkdownIt.Options

  /**
   * Plugins for Markdown It
   */
  markdownItUses?: (
    | MarkdownIt.PluginSimple
    | [MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<any>, any]
    | any
  )[]

  /**
   * A function providing the Markdown It instance gets the ability to apply custom
   * settings/plugins
   */
  markdownItSetup?: (MarkdownIt: MarkdownIt) => void

  /**
   * Options passed to [gray-matter](https://github.com/jonschlinkert/gray-matter#options)
   */
  grayMatterOptions?: GraymatterOptions

  /**
   * Class names for wrapper div
   *
   * @default 'markdown-body'
   */
  wrapperClasses?: string | string[]

  /**
   * Component name to wrapper with
   *
   * @default undefined
   */
  wrapperComponent?: string | undefined | null

  /**
   * Custom tranformations to apply _before_ and/or _after_ the markdown transformation
   *
   * Note: these transforms provide _raw_ inputs which means that "code" represents
   * markdown content along with possibly frontmatter (in the before state) and all of
   * of the SFC blocks (e.g., template, script, custom) in string format.
   */
  transforms?: {
    before?: (code: string, id: string) => string
    after?: (code: string, id: string) => string
  }

  /**
   * It is _often_ desirable to modify the link tags in your Markdown content
   * to distinguish between areas of your site, external links versus internal,
   * etc.
   *
   * This callback function can be used to modify each link as you like
   * but you can also opt to use the build in export of `linkify`:
   * ```ts
   * import Markdown, { link } from "vite-plugin-md";
   * export default defineConfig(() => {
   *    plugins: { Markdown({ linkTransforms: link() }) }
   * }
   * ```
   *
   * The `link()` builder utility is fully typed and gives you both sensible defaults
   * as well as configuration options to meet your specific needs. However, should you
   * wish to approach this at a lower level, then you can simply add in your own
   * `LinkTransformer` function.
   */
  linkTransforms?: LinkTransformer | null

  /**
   * Provides the means to send in a key/value dictionary where:
   *
   * - the _keys_ represent known words/phrases which will be converted to a link when
   * found in the body of the text of markdown files.
   * - the _values_ are either just a URL or can be a `LinkElement` key/value pairing
   */
  linkifyLookup?: Record<string, LinkElement | string>

  /**
   * Optionally allows user to explicitly whitelist files which will be transformed
   * from markdown to VueJS components. By default all files with `.md` extension
   * are included.
   */
  include?: FilterPattern
  /**
   * Allows user to add a blacklist filter to exclude transforming some of the markdown
   * files to VueJS components.
   */
  exclude?: FilterPattern
}

export interface ResolvedOptions extends Required<Options> {
  wrapperClasses: string
}

export interface ViteConfigPassthrough {
  mode: UserConfig['mode']
  base: UserConfig['base']
  [key: string]: unknown
}

export type WithConfig<T extends ResolvedOptions> = ViteConfigPassthrough & T

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
   * a tuple which defines both a rule and resultant class string which
   * is intended to applied if the rule tests positive
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

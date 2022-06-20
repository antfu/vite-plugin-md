import type MarkdownIt from 'markdown-it'
import type { FilterPattern } from '@rollup/pluginutils'
import type { Plugin, UserConfig } from 'vite'
import type { CodeBlockProperties } from '../builders/code/code-types'
import type { BuilderRegistration } from '~/builders'

export type ViteConfig = Parameters<Exclude<Plugin['configResolved'], undefined>>[0]

/**
 * The key/value definition for Route Properties.
 *
 * Note: we know that "layout" is likely and a _string_
 * but all other props are possible.
 */
export interface RouteProperties {
  layout?: string
  requiresAuth?: boolean
  section?: string
  [key: string]: unknown
}

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

export interface CodeBlockSummary {
  /** the source filename (if stated) */
  source?: string
  /** the language as described by the author */
  requestedLang: string
  /** the actual language setting used to parse the code block */
  parsedLang: string
  linesHighlighted: number[]
  /** the number of lines in the code block */
  codeLines: number
  props: CodeBlockProperties
}

/**
 * Frontmatter content is represented as key/value dictionary
 */
export interface Frontmatter {
  title?: string
  description?: string
  subject?: string
  category?: string
  name?: string
  excerpt?: string
  image?: string
  layout?: string
  requiresAuth?: boolean
  meta?: MetaProperty[]
  /**
   * Brief summary info about code blocks found on page.
   *
   * Will be populated when there are at least one code and you are using
   * the code Builder with `code({injectIntoFrontmatter: true})`.
   */
  _codeBlocks?: CodeBlockSummary[]
  [key: string]: unknown
}

export type EnumValues<T extends string | number> = `${T}`
export type Include<T, U, L extends boolean = false> = L extends true
  ? T extends U ? U extends T ? T : never : never
  : T extends U ? T : never
export type Retain<T, K extends keyof T> = Pick<T, Include<keyof T, K>>

export interface ExcerptMeta {
  fileName: string
  frontmatter: Frontmatter
}

/**
 * A function which receives the full content of the page and
 * gives control to the function to determine what part should
 * be considered the excerpt.
 *
 * Example:
 * ```ts
 * function firstFourLines(content, meta) {
 *    content = content
 *      .split('\n')
 *      .slice(0, 4)
 *      .join(' ')
 * }
 * ```
 */
export type ExcerptFunction = ((contents: string, meta: ExcerptMeta) => string) | ((contents: string) => string)

/**
 * A callback function to dynamically mutate the frontmatter properties
 * ```ts
 * const cb: FmValueCallback = (fm, filename) => ({
 *    ...fm,
 *    category: filename.includes('blog') ? 'blog' : 'unknown
 * })
 * ```
 */
export type FmValueCallback = (fm: Frontmatter, filename: string) => Frontmatter

/**
 * Values allowed to be set as frontmatter props
 */
export type FmAllowedValue = string | number | undefined | any[] | Symbol

/**
 * Options for Graymatter parser [[Docs](https://github.com/jonschlinkert/gray-matter#options)]
 */
export interface GraymatterOptions {
  excerpt?: boolean | Function
  /**
   * Define custom engines for parsing and/or stringifying frontmatter.
   *
   * Engines may either be an object with `parse` and (optionally) stringify
   * methods, or a function that will be used for parsing only.
   *
   * **Note:** we offer this because the GrayMatter library does but be sure you
   * know what you're doing if you're changing this as this repo has no test to ensure
   * that modification of this will work here.
   */
  engines?: Record<string, () => any>

  /**
   * Define the engine to use for parsing front-matter.
   *
   * ```ts
   * { language: 'yaml' }
   * ```
   *
   * **Note:** we offer this because the GrayMatter library does but be sure you
   * know what you're doing if you're changing this as this repo has no test to ensure
   * that modification of this will work here.
   *
   * @default "yaml"
   */
  language?: string

  /**
   * Open and close delimiters can be passed in as an array of strings.
   *
   * **Note:** we offer this because the GrayMatter library does but be sure you
   * know what you're doing if you're changing this as this repo has no test to ensure
   * that modification of this will work here.
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
  style?: {
    baseStyle?: 'none' | 'github'
  }

  /** allows adding in Builder's which help to expand functionality of this plugin */
  builders?: (() => BuilderRegistration<any, any>)[]

  /**
   * Explicitly set the Vue version.
   *
   * @default auto detected
   */
  vueVersion?: `2.${string}` | `3.${string}`

  /**
   * Enable head support.
   *
   * You will need to install @vueuse/head and register to App in `main.js`/`main.ts`.
   *
   * @default false
   */
  headEnabled?: boolean

  /**
   * The head field in frontmatter used to be used for `@vueuse/head`
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
   * Default values for a frontmatter properties. Property defaults can be static
   * values or be provided at build time by a callback function. In cases where
   * the callback is used, it must conform to the `FrontmatterDefaultValue`
   * type.
   *
   * All values at the page level will override these property values.
   *
   * @default {}
   */
  frontmatterDefaults?: FmValueCallback | Record<string, FmAllowedValue>

  /**
   * Can _override_ page-level author's frontmatter properties
   */
  frontmatterOverrides?: FmValueCallback | Record<string, FmAllowedValue>

  /**
   * This property determines how to process "excerpts" within your Markdown files.
   *
   * - a **boolean** true/false simply turns the feature of looking for an excerpt in the body
   * of your page on or off respectively and will use the default separator of "---" when turned on
   *
   * - a **string** value ensures that excerpt parsing is turned on but that the default separator
   * is replaced with whatever you provide.
   *
   * - a **function** gives you a callback to handle this how you see fit. Refer to the `ExcerptFunction`
   * symbol to understand the contract of this callback.
   *
   * **Note**: in all cases, if the frontmatter props are enabled and a user sets the `excerpt` property
   * this will be seen as a "default value" for the excerpt.
   *
   * @default false
   */
  excerpt?: boolean | ExcerptFunction | string

  /**
   * When using the `excerpt` functionality, this flag determines whether the excerpt text
   * found in the body should be _extracted_ from the body of the document.
   *
   * @default false
   */
  excerptExtract?: boolean

  /**
   * Expose excerpt via expose API.
   *
   * This is on by default and the feature is primarily used to allow excerpts "on page"
   * but block them being exposed externally as an export. This is clearly an edge case.
   * If you _are_ using excerpts be sure to set the `excerpt` property.
   *
   * @default true
   */
  exposeExcerpt?: boolean

  /**
   * Remove custom SFC block
   *
   * @default ['i18n']
   */
  customSfcBlocks?: string[]

  /**
   * Custom function to provide defaults to the frontmatter and
   * move certain attributes into the "meta" category.
   *
   * Note: _overriding this will remove built-in functionality setting
   * "meta" properties and the built-in "head" support. Do this only
   * if you know what you're doing._
   *
   * @deprecated all use-cases where overriding this have been removed
   * with the introduction of the Builder API
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
   *
   * **Note:** there is no problem using MarkdownIt plugins whatsoever but in many
   * cases you may find that Builder APIs are available that provider greater functionality.
   */
  markdownItUses?: (
    | MarkdownIt.PluginSimple
    | [MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<any>, any]
    | any
  )[]

  /**
   * A function providing the Markdown It instance gets the ability to apply custom
   * settings/plugins
   *
   * @deprecated prefer use of Builder API which provides an easy mechanism to wrap
   *
   */
  markdownItSetup?: (MarkdownIt: MarkdownIt) => void

  /**
   * Options which can be passed to [gray-matter](https://github.com/jonschlinkert/gray-matter)
   *
   * Note: these are a few obscure and advanced settings and should be avoided unless necessary.
   * All core functionality -- some of which the graymatter package provides -- is provided directly
   * the root of this options hash (e.g., `excerpt`, `frontmatter`, etc.)
   */
  grayMatterOptions?: Omit<GraymatterOptions, 'excerpt'>

  /**
   * Class name for the page's wrapper <div>
   *
   * @default 'markdown-body'
   */
  wrapperClasses?: string | string[]

  /**
   * A component name which the page will be wrapped with (aka,
   * the page becomes HTML and is made a _slot_ for this component)
   *
   * @default undefined
   */
  wrapperComponent?: string | undefined | null

  /**
   * Custom transformations to apply _before_ and/or _after_ the markdown transformation
   *
   * Note: these transforms provide _raw_ inputs which means that "code" represents
   * markdown content along with possibly frontmatter (in the before state) and all of
   * of the SFC blocks (e.g., template, script, custom) in string format.
   *
   * @deprecated these transforms are available using the Builder API -- as well as many more --
   * and this is the preferred means of mutating the transformation pipeline.
   */
  transforms?: {
    before?: (code: string, id: string) => string
    after?: (code: string, id: string) => string
  }

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
  frontmatterDefaults: FmValueCallback | Record<string, FmAllowedValue>
  frontmatterOverrides: FmValueCallback | Record<string, FmAllowedValue>
  /** a utility which tests whether a given builder is being used */
  usingBuilder: (name: string) => boolean
}

export interface ViteConfigPassthrough {
  mode: UserConfig['mode']
  base: UserConfig['base']
  [key: string]: unknown
}

export type WithConfig<T extends ResolvedOptions> = ViteConfigPassthrough & T

export type ReturnValues = string | string[] | number | boolean | Object

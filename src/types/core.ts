/* eslint-disable no-use-before-define */
import type MarkdownIt from 'markdown-it'
import type { FilterPattern } from '@rollup/pluginutils'
import type { Plugin, UserConfig } from 'vite'
import type { BuilderRegistration } from './pipeline'

export type ViteConfig = Parameters<Exclude<Plugin['configResolved'], undefined>>[0]

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
  [key: string]: unknown
}

export type EnumValues<T extends string | number> = `${T}`
export type Include<T, U, L extends boolean = false> = L extends true
  ? T extends U ? U extends T ? T : never : never
  : T extends U ? T : never
export type Retain<T, K extends keyof T> = Pick<T, Include<keyof T, K>>

/**
 * A function which receives the full content of the page and
 * gives control to the function to determine what part should
 * be considered the excerpt.
 *
 * Example:
 * ```ts
 * function firstFourLines(file, options) {
 *    file.excerpt = file.content
 *      .split('\n')
 *      .slice(0, 4)
 *      .join(' ')
 * }
 * ```
 */
export type ExcerptFunction = (contents: string, options: GraymatterOptions) => string

/**
 * Options for Graymatter parser [[Docs](https://github.com/jonschlinkert/gray-matter#options)]
 */
export interface GraymatterOptions {
  /**
   * Extract an excerpt that directly follows front-matter, or is the
   * first thing in the string if no front-matter exists.
   *
   * If set to excerpt `true`, it will look for the frontmatter delimiter,
   * --- by default and grab everything leading up to it.
   *
   * You can also set excerpt to a function. This function that receives the
   * full page contents and Graymatter Options as parameters and lets you
   * decide what should be included.
   *
   * @default undefined
   *
   * @deprecated use the root option of `excerpt` instead
   */
  excerpt?: boolean | ExcerptFunction

  /**
   * Define a custom separator to use for excerpts.
   *
   * This will be used only when the `excerpt` property is set
   * to `true`.
   *
   * @default undefined
   *
   * @deprecated use a string value in the root `excerpt` option instead
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
  /** allows adding in Builder's which help to expand functionality of this plugin */
  builders?: (() => BuilderRegistration<any, any>)[]

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
   * This property determines how to process "excerpts" and acts as a "smart
   * proxy" to the `excerpt` and `excerpt_separator` properties on the popular
   * graymatter package.
   *
   * When this property is set to `true` it uses looks in the body of page
   * and extracts text up to the first "`---`" separator it finds (after
   * frontmatter).
   *
   * If you'd prefer that it instead looks for some _other_ text as a separator
   * you can state that as a string value (this has the same effect of setting `true` and then changing the Graymatter option of `excerpt_separator`).
   *
   * Finally, if you want full control, you can put in a function and receive
   * a callback with the full contents of the page and you can programatically
   * decide what to make
   *
   * @default false
   */
  // TODO: this is a change and should get some design review; I think it makes
  // a lot of logical sense but the prior goals -- which were split between this
  // property and Graymatter options -- were not documented so I may have missed
  // some intent
  excerpt?: boolean | ExcerptFunction | string

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
  /** a utility which tests whether a given builder is being used */
  usingBuilder: (name: string) => boolean
}

export interface ViteConfigPassthrough {
  mode: UserConfig['mode']
  base: UserConfig['base']
  [key: string]: unknown
}

export type WithConfig<T extends ResolvedOptions> = ViteConfigPassthrough & T

/* eslint-disable no-use-before-define */
import type MarkdownIt from 'markdown-it'
import type { FilterPattern } from '@rollup/pluginutils'

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
   * If `true`, it will be passed to `frontmatterPreprocess` as `frontmatter.excerpt`, replacing the `excerpt` key in frontmatter, if there's any
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
  ) => {
    head: Record<string, any>
    frontmatter: Frontmatter
  }

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
   * Custom tranformations apply before and after the markdown transformation
   */
  transforms?: {
    before?: (code: string, id: string) => string
    after?: (code: string, id: string) => string
  }

  include?: FilterPattern
  exclude?: FilterPattern
}

export interface ResolvedOptions extends Required<Options> {
  wrapperClasses: string
}

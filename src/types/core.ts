import type MarkdownIt from 'markdown-it'
import type { UserConfig } from 'vite'
import type { BuilderOptions, ConfiguredBuilder } from '@yankeeinlondon/builder-api'
import type { MetaOptions } from '@yankeeinlondon/meta-builder'
import type { FilterPattern } from '../utils/createFilter'
import type { HeadProps, Pipeline, PipelineStage } from './pipeline'

export type GenericBuilder = ConfiguredBuilder<string, BuilderOptions, PipelineStage, string>

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

/**
 * **SfcBlocks**
 *
 * The VueJS SFC _blocks_ which will make up the `.vue` file.
 */
export interface SfcBlocks {
  /** the HTML template block of the SFC */
  html: string

  /**
   * All properties destined for the HEAD section of the
   * page. This includes the title, meta tags, links,
   * script blocks, etc.
   *
   * It also includes `htmlAttrs` and `bodyAttrs` which are the block
   * attributes associated to the `<html>` and `<body>` sections
   * respectively.
   */
  head: HeadProps

  /**
   * All the script blocks found on the page.
   *
   * Note: all `<script setup>` blocks will be combined into one
   * where the traditional `<script>` blocks will be left as
   * separates
   */
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

/**
 * **MetaProperty**
 *
 * a `<meta />` property destined for the HEAD section of an HTML
 * page with the following key/value pairs.
 */
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
  description?: string
  subject?: string
  category?: string
  name?: string
  excerpt?: string
  image?: string
  layout?: string
  requiresAuth?: boolean
  /**
   * an array of _meta_ tags which are intended to make their way into the HEAD section of the page to provide useful meta-data for users
   */
  meta?: MetaProperty[]
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
 *    return content
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
export type FmAllowedValue = string | number | undefined | any[] | Symbol | boolean

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

/**
 * Type utility which converts items in the _builders_ array into ConfiguredBuilders
 */
export type ToBuilder<T extends (readonly any[]) | undefined> = T extends readonly any[]
  ? Readonly< {
    [K in keyof T]: T[K] extends 'none'
      ? []
      : T[K] extends ConfiguredBuilder<string, {}, PipelineStage, string>
        ? T[K] extends ConfiguredBuilder<infer Name, infer Options, infer Stage, infer Desc>
          ? ConfiguredBuilder<Name, Options, Stage, Desc>
          : never
        : T[K]
  }>
  : readonly []

/**
 * Pulls out the builder type from an `Options`, `Partial<Options>` or a `ResolvedOptions`
 */
export type BuilderFrom<
  T extends Options<readonly any[] | readonly []>
  | Partial<Options<readonly any[] | readonly []>>
  | ResolvedOptions<readonly any[]>,
> = //
  T extends ResolvedOptions<readonly any[] | readonly[]>
    ? T['builders']
    : T extends Options<readonly any[] | readonly[]>
      ? T['builders']
      : T extends Partial<Options<readonly any[] | readonly[]>>
        ? Exclude<T['builders'], undefined>
        : never

export type EnsureBuilder<
  E,
  R extends readonly GenericBuilder[] | [],
> = E extends ConfiguredBuilder<any, any, any, any>
  ? E extends ConfiguredBuilder<infer Name, infer Options, infer Stage, infer Desc>
    ? readonly [...R, ConfiguredBuilder<Name, Options, Stage, Desc>]
    : never
  : readonly [...R, E]

export interface Options<
  B extends readonly any[] | readonly [] = readonly [],
> {
  /**
   * Manage the details of how to deal with meta data such as
   * `title` tag, the `<meta>` tags, your icon and more.
   *
   * **Note:** this is the same properties which the `meta-builder` API
   * provides and that is because we are now including this Builder API
   * as part of core.
   */
  meta: MetaOptions

  style: {
    baseStyle?: 'none' | 'github'
  }

  /** allows adding in Builder's which help to expand functionality of this plugin */
  builders: ToBuilder<B>

  /**
   * Explicitly set the Vue version.
   *
   * @default auto detected
   */
  vueVersion: `2.${string}` | `3.${string}`

  /**
   * **headEnabled**
   *
   * Enable head support.
   *
   * You will need to install @vueuse/head and register to your App in `main.js`/`main.ts`
   * but doing so will enable the VueJS files you are creating to gain access to the
   * HEAD section of the page. To get the full power of this plugin it _is_ recommended
   * that you _do_ turn this on but the default remains as `false`.
   *
   * @default false
   */
  headEnabled: boolean

  /**
   * @deprecated no function currently
   *
   * Now that the **meta-builder** is included by default and is responsible
   * for handling props which go into the HEAD section of the page. You can use
   * props such as `titleProp`, `descProp`, `routeProp` and `layoutProp`, along
   * with other properties originally associated with the **meta-builder**
   * underneath the "meta" property
   */
  headField: string

  /**
   * **frontmatter**
   *
   * A boolean switch which determines whether we will parse for frontmatter in your markdown.
   *
   * Note: unless you want to reduce functionality considerably you should leave
   * this to the default value of `true`.
   *
   * @default true
   * @deprecated
   */
  frontmatter: boolean

  /**
   * **frontmatterDefaults**
   *
   * Default values for a frontmatter properties. Property defaults can be static
   * dictionary value or a callback function can be run which receives current frontmatter
   * and the filename as inputs.
   *
   * All values at the page level will override these property values; use `frontmatterOverrides`
   * if you want to _override_ page level props.
   *
   * @default {}
   */
  frontmatterDefaults: FmValueCallback | Record<string, FmAllowedValue>

  /**
   * **frontmatterOverrides**
   *
   * Allows this plugin to override certain frontmatter values on the page. This
   * can be a static dictionary of key/values but it can also interact with the
   * page by defining a callback which receives both the filename and the frontmatter
   * props at this stage in the process and your callback simply returns a dictionary
   * which can _add_ props or _override_ current ones.
   *
   * @default {}
   */
  frontmatterOverrides: FmValueCallback | Record<string, FmAllowedValue>

  /**
   * **excerpt**
   *
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
  excerpt: boolean | ExcerptFunction | string

  /**
   * When using the `excerpt` functionality, this flag determines whether the excerpt text
   * found in the body should be _extracted_ from the body of the document.
   *
   * @default false
   */
  excerptExtract: boolean

  /**
   * **exposeExcerpt**
   *
   * Expose excerpt via expose API.
   *
   * This is on by default and the feature is primarily used to allow excerpts "on page"
   * but block them being exposed externally as an export. This is clearly an edge case.
   * If you _are_ using excerpts be sure to set the `excerpt` property.
   *
   * @default true
   */
  exposeExcerpt: boolean

  /**
   * **exposeFrontmatter**
   *
   * Expose frontmatter via expose API
   * ```ts
   * const fm = import("page.md").frontmatter;
   * ```
   *
   * @default true
   */
  exposeFrontmatter: boolean

  /**
   * **customSfcBlocks**
   *
   * Remove custom SFC block
   *
   * @default ['i18n']
   * @deprecated use `removeSfcBlocks` instead ... same functionality better name
   */
  customSfcBlocks: string[]

  /**
   * **removeSfcBlocks**
   *
   * Allows the removal of certain SFC blocks found in the page
   *
   * @default ['i18n']s
   */
  removeSfcBlocks: string[]

  /**
   * **escapeCodeTagInterpolation**
   *
   * Add `v-pre` to `<code>` tag to escape curly brackets interpolation
   *
   * @see https://github.com/antfu/vite-plugin-md/issues/14
   * @default true
   */
  escapeCodeTagInterpolation: boolean

  /**
   * **markdownItOptions**
   *
   * Options passed to Markdown It parser
   *
   * @default { html: true, linkify: true, typographer: true }
   */
  markdownItOptions: MarkdownIt.Options

  /**
   * **markdownItUses**
   *
   * Plugins for Markdown It
   *
   * **Note:** there is no problem using MarkdownIt plugins whatsoever but in many
   * cases you may find that Builder APIs are available that provider greater functionality.
   */
  markdownItUses: (
    | MarkdownIt.PluginSimple
    | [MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<any>, any]
    | any
  )[]

  /**
   * Options which can be passed to [gray-matter](https://github.com/jonschlinkert/gray-matter)
   *
   * Note: these are a few obscure and advanced settings and should be avoided unless necessary.
   * All core functionality -- some of which the graymatter package provides -- is provided directly
   * the root of this options hash (e.g., `excerpt`, `frontmatter`, etc.)
   */
  grayMatterOptions: Omit<GraymatterOptions, 'excerpt'>

  /**
   * **wrapperClasses**
   *
   * Class name for the page's wrapper <div>
   *
   * @default 'markdown-body'
   */
  wrapperClasses: string | string[]

  /**
   * **wrapperComponent**
   *
   * A component name which the page will be wrapped with (aka,
   * the page becomes HTML and is made a _slot_ for this component)
   *
   * @default undefined
   */
  wrapperComponent: string | undefined | null

  /**
   * **getFinalizedReport**
   *
   * Hooks into the finalized output of each file. No opportunity to mutate the
   * pipeline but does provide a means to track progress.
   */
  getFinalizedReport: (<B extends readonly GenericBuilder[]>(cb: Pipeline<'closeout', B>) => void) | null

  /**
   * **mutateParsed**
   *
   * Allows someone to quickly mutate the pipeline at the 'parsed' stage. This will
   * be run after all builder-api's at that stage have run.
   */
  mutateParsed: (<B extends readonly GenericBuilder[]>(cb: Pipeline<'parsed', B>) => Pipeline<'parsed', B>) | null

  /**
   * **mutateSfcBlocks**
   *
   * Allows someone to quickly mutate the pipeline at the 'sfcBlocksExtracted' stage. This will
   * be run after all builder-api's at that stage have run.
   */
  mutateSfcBlocks: (<B extends readonly GenericBuilder[]>(cb: Pipeline<'sfcBlocksExtracted', B>) => Pipeline<'sfcBlocksExtracted', B>) | null

  /**
   * **include**
   *
   * Whitelists files which should be processed by this plugin. By default all files
   * with `.md` extension are included.
   */
  include: FilterPattern | null
  /**
   * **exclude**
   *
   * Allows certain files to be blacklisted from the "include" list. By default this
   * is not set.
   */
  exclude: FilterPattern | null
}

/**
 * **ResolvedOptions**
 *
 * Options which have merged in default values with the user's inputs
 * to form the finalized _options_ for `vite-plugin-md` runtime.
 *
 * Also adds a few props such as `usingBuilder()`, etc.
 */
export interface ResolvedOptions<
  B extends readonly any[] | readonly [],
> extends Options<readonly any[] | readonly []> {
  [x: string]: any
  wrapperClasses: string
  frontmatterDefaults: FmValueCallback | Record<string, FmAllowedValue>
  frontmatterOverrides: FmValueCallback | Record<string, FmAllowedValue>
  /**
   * a utility which tests whether a given builder is being used
   */
  usingBuilder: (name: string) => boolean
  /**
   * The Builder APIs being used with `vite-plugin-md`
   */
  builders: B
}

export interface ViteConfigPassthrough {
  mode: UserConfig['mode']
  base: UserConfig['base']
  [key: string]: unknown
}

export type WithConfig<T extends ResolvedOptions<any>> = ViteConfigPassthrough & T

export type ReturnValues = string | string[] | number | boolean | Object

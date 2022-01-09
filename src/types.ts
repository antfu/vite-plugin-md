/* eslint-disable no-use-before-define */
import type MarkdownIt from 'markdown-it'
import type { FilterPattern } from '@rollup/pluginutils'

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
   * Custom function to process the frontmatter
   */
  frontmatterPreprocess?: (frontmatter: Record<string, unknown>, options: ResolvedOptions) => any

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
  markdownItUses?: (MarkdownIt.PluginSimple | [MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<any>, any] | any)[]

  /**
   * A function providing the Markdown It instance gets the ability to apply custom settings/plugins
   */
  markdownItSetup?: (MarkdownIt: MarkdownIt) => void

  /**
   * Options passed to grayMatter
   * TODO grayMatterOptions type
   */
  grayMatterOptions?: any

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

/* eslint-disable no-use-before-define */
import type MarkdownIt from 'markdown-it'

export interface Options {
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
   * Remove custom SFC block
   *
   * @default ['route', 'i18n']
   */
  customSfcBlocks?: string[]

  /**
   * Custom function to process the frontmatter
   */
  frontmatterPreprocess?: (frontmatter: any, options: ResolvedOptions) => any

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
   * Custom tranformations apply before and after the markdown transformation.
   */
  transforms?: {
    before?: (code: string, id: string) => string
    after?: (code: string, id: string) => string
  }
}

export interface ResolvedOptions extends Required<Options> {
  wrapperClasses: string
}

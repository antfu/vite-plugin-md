import type MarkdownIt from 'markdown-it'
import { TransformContext } from 'vite/dist/node/transform'

export interface Options {
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
    before?: (ctx: TransformContext) => string
    after?: (ctx: TransformContext) => string
  }
}

export type ResolvedOptions = Required<Options>

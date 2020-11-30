import type MarkdownIt from 'markdown-it'

export interface Options {
  markdownItOptions?: MarkdownIt.Options
  /**
   * Class names for wrapper div
   *
   * @default 'markdown-body'
   */
  wrapperClasses?: string | string[]
}

export type ResolvedOptions = Required<Options>

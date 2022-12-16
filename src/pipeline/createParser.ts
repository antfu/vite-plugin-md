import MarkdownIt from 'markdown-it'
import type { GenericBuilder } from '../types/core'
import { transformer } from '../utils'

/**
 * Creates a **MarkdownIt** parser instance which this plugin will use for all processing.
 */
export const createParser = <B extends readonly GenericBuilder[]>() => transformer<B>()('metaExtracted', (payload) => {
  const parser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...(payload.options?.markdownItOptions ? payload.options.markdownItOptions : {}),
  })

  parser.linkify.set({ fuzzyLink: false })

  return { ...payload, parser, stage: 'parser' }
})

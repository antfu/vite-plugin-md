import { toArray } from '@antfu/utils'
import MarkdownIt from 'markdown-it'
import type { ResolvedOptions, WithConfig } from '../types'
import MdLink from '../builders/plugins/md-link'

/**
 * Creates a **MarkdownIt** object which this plugin will use for all processing.
 * All user options are used to make sure this instance is fully configured.
 */
export function createParser(id: string, options: WithConfig<ResolvedOptions>) {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...(options?.markdownItOptions ? options.markdownItOptions : {}),
  })

  markdown.linkify.set({ fuzzyLink: false })
  if (options.linkTransforms) {
    markdown.use(MdLink, {
      transform: options.linkTransforms,
      base: options?.base || '/',
      file: id,
    })
  }

  options.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)

    markdown.use(plugin, options)
  })

  options.markdownItSetup(markdown)

  return markdown
}

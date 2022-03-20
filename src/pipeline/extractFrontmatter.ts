import matter from 'gray-matter'
import type { ExcerptFunction, Pipeline, PipelineStage } from '../@types'
import type { GraymatterOptions } from '../@types/core'

/**
 * Extracts meta data for the page:
 *
 * - it also applies some logic to resolve the Graymatter configuration while we still have
 * overlap between `options.extract` and the related options on Graymatter hash (depreacated)
 * - use the `gray-matter` npm package to separate frontmatter from Markdown content
 * - updates the "options" for Graymatter to reflect to downstream consumers what the
 * actual configuration used was.
 */
export function extractFrontmatter(payload: Pipeline<PipelineStage.initialize>): Pipeline<PipelineStage.metaExtracted> {
  const { options: { grayMatterOptions: { excerpt: ge }, excerpt: e } } = payload
  const eConfig = [e, ge]
  const excerpt = eConfig.find(i => i === false) !== undefined
    ? false
    : eConfig.find(i => typeof i === 'function')
      ? eConfig.find(i => typeof i === 'function') as ExcerptFunction
      : true

  const excerpt_separator = excerpt === false
    // used to ensure all text stays in body
    ? undefined
    : typeof e === 'string'
      ? e
      : (ge as unknown as string) || undefined

  // parse using graymatter package
  const o: GraymatterOptions = {
    ...payload.options.grayMatterOptions,
    excerpt,
    ...(excerpt_separator ? { excerpt_separator } : {}),
  }
  const r = matter(payload.content, o)

  return {
    ...payload,
    options: {
      ...payload.options,
      // normalize graymatter settings to what was actually set
      // for downstream participants
      grayMatterOptions: o,
    },
    // prefer page property value over body at this stage so that
    // builders might be able to distinquish between the two
    frontmatter: { ...r.data, excerpt: r?.data?.excerpt?.trim() || r?.excerpt?.trim() || undefined },
    md: r.content,
    excerpt: r.excerpt || r.data?.excerpt || undefined,
    meta: [],
    head: [],
    routeMeta: {},
  }
}

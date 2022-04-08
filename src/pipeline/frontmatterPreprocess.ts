import type { MetaProperty } from '../types'
import { transformer } from '../utils'

/**
 * Runs the `frontmatterPreprocess()` hook unless configured not to.
 *
 * Note: the links() builder will turn this off (setting to undefined)
 */
export const frontmatterPreprocess = transformer('metaExtracted', 'metaExtracted', (payload) => {
  const { frontmatter, options: { frontmatterPreprocess } } = payload
  let { head, meta, routeMeta } = payload

  const results = frontmatterPreprocess
    ? { ...payload, ...frontmatterPreprocess(frontmatter, payload.options) }
    : payload

  if (results.head?.meta && Array.isArray(results.head?.meta))
    meta = [...meta, ...results.head.meta] as MetaProperty[]

  head = { ...head, ...results.head }
  routeMeta = { ...routeMeta, ...results.routeMeta }

  return { ...payload, ...results, head, meta, routeMeta }
})

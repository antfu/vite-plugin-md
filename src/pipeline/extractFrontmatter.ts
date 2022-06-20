import matter from 'gray-matter'
import type {
  ExcerptFunction,
  Frontmatter,
  GraymatterOptions,
  Pipeline,
  PipelineStage,
} from '../types'
import { transformer } from '../utils'
import { MdError } from '../MdError'

/**
 * Given the frontmatter passed in, plus the pipeline data,
 * resolves the frontmatter data to it's appropriate state.
 * It considers:
 *
 * - default values
 * - overrides
 * - and for `excerpt` property it gives precedent to any value
 */
function resolveFrontmatter(
  fm: Frontmatter,
  p: Pipeline<PipelineStage.initialize>,
) {
  const { frontmatterDefaults, frontmatterOverrides } = p.options

  const defValues = typeof frontmatterDefaults === 'function'
    ? frontmatterDefaults(fm, p.fileName)
    : frontmatterDefaults
  const overrides = typeof frontmatterOverrides === 'function'
    ? frontmatterOverrides(fm, p.fileName)
    : frontmatterOverrides

  return {
    ...defValues,
    ...fm,
    ...overrides,
  }
}

/**
 * Extracts meta data for the page, which fits into two parts:
 *
 * 1. `frontmatter` - all basic name/value pairs in the frontmatter section of
 * the page will be extracted as a dictionary
 * 2. `excerpt` - the "excerpt" property is meant to represent a summary of the content
 * that the page contains and is often used on pages where a _list_ of pages presents
 * basic meta along with the beginning of the page. The content for this page can be
 * sourced in a few ways:
 *     - **Excerpt Delimiter** rather than arbitrarily cutting off after some number of
 * characters or lines in a given page, the author can provide a "delimiter" and all content
 * _above_ that delimiter will be considered the excerpt (note: the default delimiter is "---").
 *     - **Callback Function** if the global `excerpt` option is set as a callback function, then
 * this function will be called on each page and the function will be used to determine which
 * part is the excerpt.
 *     - **Frontmatter Prop** as a fallback for all pages where the author doesn't add an excerpt
 * delimiter, if the `excerpt` property is set in the frontmatter then this will be used. It is
 * worth noting that opens up the possibility of having an callback function associated to this
 * properties "default value".
 *
 * A vast majority of this functionality is provided by leveraging the
 * [GrayMatter](https://github.com/jonschlinkert/gray-matter) library.
 */
export const extractFrontmatter = transformer('extractFrontmatter', 'initialize', 'metaExtracted', (p) => {
  if (!p.options.frontmatter) {
    return {
      ...p,
      frontmatter: {},
      md: p.content,
      meta: [],
      head: [],
      routeMeta: {},
    } as unknown as Pipeline<PipelineStage.metaExtracted>
  }

  if (p.options.excerptExtract && typeof p.options.excerpt === 'function')
    throw new MdError('the vite-plugin-md plugin was configured with "excerptExtract" to true and had a callback function for the "excerpt" property. This is not allowed as there is not a reliable way to extract the excerpt (as it may have been modified from what was on the page).')

  const excerpt_separator = p.options.excerpt === false
    ? undefined
    : typeof p.options.excerpt === 'string'
      ? p.options.excerpt
      : typeof p.options.excerpt === 'function'
        ? false
        : '---'

  // parse using graymatter package
  let go: GraymatterOptions = {
    ...p.options.grayMatterOptions,
    ...(excerpt_separator ? { excerpt_separator } : {}),
  }

  interface GrayFile {
    content: string
    data: Frontmatter
    excerpt?: string
    [key: string]: unknown
  }

  /** the "excerpt" value for the GrayMatter API */
  const excerpt: boolean | Function = typeof p.options.excerpt === 'function'
    ? (file: GrayFile) => {
        const frontmatter = resolveFrontmatter(file.data, p)
        const ex = (p.options.excerpt as ExcerptFunction)(file.content, {
          frontmatter,
          fileName: p.fileName,
        })
        file.excerpt = ex
      }
    : typeof p.options.excerpt === 'boolean'
      ? p.options.excerpt
      // default value
      : false

  go = { ...go, excerpt }

  const r = matter(p.content || '', go as any)
  const md = p.options.excerptExtract && r.excerpt
    ? (r?.content || '').replace(r?.excerpt, '')
    : r?.content || ''

  // note: return type explicit as injection of utility functions was already done
  // but not registered in type system
  return {
    ...p,
    options: {
      ...p.options,
      grayMatterOptions: go,
    },
    frontmatter: resolveFrontmatter({
      ...r.data,
      excerpt: r.excerpt || r.data?.excerpt,
    }, p),
    md,
    excerpt: p.options.excerpt === false
      ? undefined
      : r.excerpt || r.data?.excerpt || undefined,
    meta: [],
    head: [],
    routeMeta: {},
  } as unknown as Pipeline<PipelineStage.metaExtracted>
})

import matter from 'gray-matter'
import type MarkdownIt from 'markdown-it'
import type { Frontmatter, GraymatterOptions, MetaProperty, ResolvedOptions, RouteProperties, WithConfig } from '../types'
import { createParser } from './createParser'

export type MatterContent = string | { content: string }

export interface Metadata {
  /** the unique id for the given element being processed */
  id: string
  /**
   * The name/value _frontmatter_ dictionary.
   *
   * Note: even if the frontmatter option param is set to `false` we will return
   * frontmatter content at this stage so that future mapping into meta or head
   * properties in general is possible.
   */
  frontmatter: Frontmatter
  /**
   * The markdown content with the frontmatter extracted
   */
  md: string

  /** the markdown-it parser */
  mdi: MarkdownIt
  /**
   * The html generated from the markdown
   */
  html: string

  /**
   * The frontmatter's configuration language (e.g., TOML, etc.)
   */
  language: string

  /**
   * The excerpt text.
   *
   * Note: when the `options.excerpt` option is set to true, this excerpt text is
   * brought into the _frontmatter_'s "excerpt" property name otherwise it will be
   * left as a separate data entity.
   */
  excerpt: string | null

  /**
   * The non-META properties which are intended for HEAD of the given page
   */
  head: Record<string, any>

  /**
   * The meta-properties which are intended to be set in the HEAD of the given page
   */
  metaProps: MetaProperty[]

  /**
   * The properties which are intended to be shared with the ROUTER as meta properties
   */
  routeMeta: RouteProperties
}

/**
 * Extracts meta data for the page. This starts by wrapping the popular
 * `gray-matter` npm package to separate frontmatter from Markdown content
 * but then also includes running the frontmatter through the preprocessor
 * and isolating meta props, header props, and router meta.
 */
export function extractMeta(raw: MatterContent, id: string, options: WithConfig<ResolvedOptions>): Metadata {
  const o: GraymatterOptions = {
    ...options.grayMatterOptions,
    excerpt: options.excerpt || options.grayMatterOptions.excerpt,
  }

  const r = matter(raw, o)
  const { frontmatter, head, metaProps, routeMeta } = options.frontmatterPreprocess(options.excerpt ? { ...r.data, excerpt: r.excerpt || r.data?.excerpt } : r.data, options)
  const mdi = createParser(id, options)
  const html = mdi.render(r.content, {})

  const fm: Metadata = {
    id,
    frontmatter,
    md: r.content,
    html,
    mdi,
    language: r.language,
    excerpt: r.excerpt || r.data?.excerpt || null,
    head: head || {},
    metaProps: metaProps || [],
    routeMeta: routeMeta || {},
  }

  return fm
}

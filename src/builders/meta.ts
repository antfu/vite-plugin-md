import { addMetaTag } from '../pipeline/addMetaTag'
import type { Frontmatter, MetaProperty, ProcessedFrontmatter, ResolvedOptions } from '../types'

export type MetaFlag = [prop: string, defVal: boolean]

export type HeadProperties = 'title'|
'link'|
'base'|
'style'|
'script'|
'htmlAttrs'|
'bodyAttrs'

export type DefaultValueCallback = (fm: Frontmatter) => any

export interface MetaConfig {
  /**
   * Properties which found in frontmatter will be transformed to "meta" properties in HEAD
   */
  metaProps: string[]

  routeProps: string[]

  headProps: HeadProperties[]

  /** default values for a property if none was stated */
  defaults: Record<string, any | DefaultValueCallback>
}

export const meta = (config: Partial<MetaConfig> = {}) => {
  const c: MetaConfig = {
    metaProps: ['image', 'title', 'description', 'url', 'image_width', 'image_height'],
    routeProps: ['layout'],

    headProps: ['title'],
    defaults: {},

    ...config,
  }

  /**
   * copy frontmatter props into HEAD, META, and ROUTE meta
   */
  return (frontmatter: Frontmatter, options: ResolvedOptions): ProcessedFrontmatter => {
    if (!options.frontmatter)
      return { head: {}, metaProps: [], routeMeta: {}, frontmatter: {} }

    // convert all defaults to concrete values
    for (const k of Object.keys(c.defaults)) {
      if (typeof c.defaults[k] === 'function')
        c.defaults[k] = (c.defaults[k] as unknown as DefaultValueCallback)(frontmatter)
    }

    frontmatter = [...Object.keys(frontmatter), ...Object.keys(c.defaults)].reduce(
      (acc, p) => ({ ...acc, [p]: frontmatter[p] || c.defaults[p] }),
      {},
    )

    const head: Record<string, any> = c.headProps.reduce(
      (acc, p) => ({ ...acc, [p]: frontmatter[p as string] }),
      {},
    )

    const metaProps: MetaProperty[] = c.metaProps.reduce(
      (acc, p) => frontmatter[p as string] || c.defaults[p as string]
        ? [...acc, addMetaTag(p, frontmatter[p as string])]
        : acc,
      [] as MetaProperty[],
    )

    const routeMeta: Record<string, any> = c.routeProps.reduce(
      (acc, p) => ({ ...acc, [p]: frontmatter[p as string] }),
      {},
    )

    return {
      head,
      metaProps,
      routeMeta,
      frontmatter,
    }
  }
}

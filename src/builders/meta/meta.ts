import type { Frontmatter, MetaProperty } from '../../types'
import { createBuilder } from '../createBuilder'

export type MetaFlag = [prop: string, defVal: boolean]

export type HeadProperties = 'title'
| 'link'
| 'base'
| 'style'
| 'script'
| 'htmlAttrs'
| 'bodyAttrs'

export type DefaultValueCallback = (fm: Frontmatter, filename: string) => any

function addMetaTag(k: string, v: any): MetaProperty {
  return ({
    name: `twitter:${k}`,
    property: `og:${k}`,
    itemprop: k,
    key: k,
    content: v,
  })
}

export interface MetaConfig {
  /**
   * Properties in frontmatter dictionary which will be treated as "meta" properties
   * when discovered in documents
   *
   * @default ['title', 'description', 'image', 'url', 'image_width', 'image_height']
   */
  metaProps: string[]
  /**
   * Properties in frontmatter dictionary which will be treated as "route meta" properties
   * when discovered in documents
   *
   * @default ['layout']
   */
  routeProps: string[]

  /**
   * Properties in frontmatter dictionary which will be treated as HEAD properties
   * when discovered in documents
   *
   * @default ['title']
   */
  headProps: HeadProperties[]

  /**
   * Default values for a frontmatter property if none was stated in the doc. Property defaults
   * can be static values or be provided at build time by a passed in callback function.
   * In cases where the callback is desireable, it will conform t the `DefaultValueCallback`
   * type:
   * ```ts
   * const cb: DefaultValueCallback = (
   *   frontmatter: Frontmatter,
   *   fileName: string
   * ) => Record<string, any>
   * ```
   *
   * @default {}
   */
  defaults: Record<string, string | number | any[] | DefaultValueCallback>

  /**
   * provides a callback hook that is called directly after the default values for frontmatter
   * properties are merged with the page specific properties and allows this callback to take
   * an authoritative view on what the final property values should be
   */
  override?: (frontmatter: Frontmatter, fileName: string) => Frontmatter
}

export const meta = createBuilder('meta', 'metaExtracted')
  .options<Partial<MetaConfig>>()
  .initializer()
  .handler(async (p, o) => {
    let { frontmatter, meta, head, routeMeta } = p
    const c: MetaConfig = {
      metaProps: ['image', 'title', 'description', 'url', 'image_width', 'image_height'],
      routeProps: ['layout'],

      headProps: ['title'],
      defaults: {},

      ...o,
    }

    // convert all defaults to concrete values
    for (const k of Object.keys(c.defaults)) {
      if (typeof c.defaults[k] === 'function')
        c.defaults[k] = (c.defaults[k] as unknown as DefaultValueCallback)(frontmatter, p.fileName)
    }

    frontmatter = [
      ...Object.keys(c.defaults),
      ...Object.keys(frontmatter),
    ].reduce(
      // iterate over all keys defined in page's Frontmatter dictionary
      // or defined with a "default value"
      (acc, p) => ({ ...acc, [p]: frontmatter[p] || c.defaults[p] }),
      {},
    )
    if (c.override)
      frontmatter = c.override(frontmatter, p.fileName)

    head = {
      ...head,
      ...c.headProps.reduce(
        (acc, p) => ({ ...acc, [p]: frontmatter[p as string] }),
        {},
      ),
    }

    meta = [
      ...meta,
      ...c.metaProps.reduce(
        (acc, p) => frontmatter[p as string] || c.defaults[p as string]
          ? [...acc, addMetaTag(p, frontmatter[p as string])]
          : acc,
        [] as MetaProperty[],
      ),
    ]

    routeMeta = {
      ...routeMeta,
      ...c.routeProps.reduce(
        (acc, p) => ({ ...acc, [p]: frontmatter[p as string] }),
        {},
      ),
    }

    return {
      ...p,
      head,
      meta,
      routeMeta,
      frontmatter,
    }
  })
  .meta({
    description: 'adds meta-tags to the HEAD of the page in a way that is easily digested by social media sites and search engines',
  })

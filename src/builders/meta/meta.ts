import type { Frontmatter, MetaProperty } from '../../@types'
import { createBuilder } from '../createBuilder'

export type MetaFlag = [prop: string, defVal: boolean]

export type HeadProperties = 'title'
| 'link'
| 'base'
| 'style'
| 'script'
| 'htmlAttrs'
| 'bodyAttrs'

export type DefaultValueCallback = (fm: Frontmatter) => any

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
   * Properties which found in frontmatter will be transformed to "meta" properties in HEAD
   */
  metaProps: string[]

  routeProps: string[]

  headProps: HeadProperties[]

  /** default values for a property if none was stated */
  defaults: Record<string, any | DefaultValueCallback>
}

export const meta = createBuilder('meta', 'metaExtracted')
  .options<Partial<MetaConfig>>()
  .initializer()
  .handler((p, o) => {
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
        c.defaults[k] = (c.defaults[k] as unknown as DefaultValueCallback)(frontmatter)
    }

    frontmatter = [...Object.keys(frontmatter), ...Object.keys(c.defaults)].reduce(
      (acc, p) => ({ ...acc, [p]: frontmatter[p] || c.defaults[p] }),
      {},
    )

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

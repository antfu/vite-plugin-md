import type { Frontmatter, MetaProperty, Pipeline, PipelineStage, RouteConfig } from '../../types'
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

/**
 * A callback for meta-builder callbacks
 */
export type MetaCallback<T> = (filename: string, frontmatter: Pipeline<PipelineStage.parser>['frontmatter']) => T

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
   * Allows the user to configure a bespoke scheme for setting a page's route path.
   * By default the path is simply a direct artifact of the filename and directory.
   */
  routePath?: MetaCallback<string>

  /**
   * You can pass in a callback to resolve route names; you'll be passed
   * the filename and frontmatter data for each page to determine what
   * the name should be. By default the name is not defined.
   *
   * @default undefined
   */
  routeName?: MetaCallback<string>

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
    let { frontmatter, meta, head } = p
    const c: MetaConfig = {
      metaProps: ['image', 'title', 'description', 'url', 'image_width', 'image_height'],
      routeProps: ['layout', 'requiresAuth'],

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

    const routeMetaProps: Record<string, any> = c.routeProps.reduce(
      (acc, p) => (
        p in frontmatter
          ? { ...acc, [p]: frontmatter[p as string] }
          : acc
      ),
      {},
    )

    const routeMeta: RouteConfig = {
      ...p.routeMeta,
      ...(c.routeName ? { name: c.routeName(p.fileName, p.frontmatter) } : {}),
      ...(c.routePath ? { path: c.routePath(p.fileName, p.frontmatter) } : {}),
      ...(Object.keys(routeMetaProps).length > 0 ? { meta: routeMetaProps } : {}),
    }

    return {
      ...p,
      head,
      meta,
      routeMeta: Object.keys(routeMeta).length > 0 ? routeMeta : undefined,
      frontmatter,
    }
  })
  .meta({
    description: 'adds meta-tags to the HEAD of the page in a way that is easily digested by social media sites and search engines',
  })

import type { Frontmatter, MetaProperty, Pipeline, PipelineStage, ReturnValues, RouteConfig } from '../../types'
import { keys, valueOrCallback } from '../../utils'
import { createBuilder } from '../createBuilder'

export type MetaFlag = [prop: string, defVal: boolean]

export type HeadProperties = 'title'
| 'link'
| 'base'
| 'style'
| 'script'
| 'htmlAttrs'
| 'bodyAttrs'

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
export type MetaCallback<T extends ReturnValues> = (filename: string, frontmatter: Pipeline<PipelineStage.parser>['frontmatter']) => T

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
  routePath?: string | MetaCallback<string>

  /**
   * This defines the name of the _frontmatter property_ which will map to the
   * route's "name". If this property is set in a page's frontmatter then the page
   * will import Vue Router to set the name.
   *
   * **Note:** if you want a callback function to set the name instead of a frontmatter property
   * then use the `routeName` callback instead.
   *
   * @default "routeName"
   */
  routeNameProp?: string | false

  /**
   * Allows you to pass in a callback function which will receive both the _filename_ and
   * the _frontmatter_ on the page to allow your callback to decide what the name for the
   * route should be.
   *
   * Note: return `false` if you don't want the page to be a named route. Also, if you prefer
   * a simple frontmatter property to name mapping you can instead use the `routeMetaProp`
   * option instead of this.
   */
  routeName?: MetaCallback<string | false>

  /**
   * Properties in frontmatter dictionary which will be treated as HEAD properties
   * when discovered in documents
   *
   * @default ['title']
   */
  headProps: HeadProperties[]

  /**
   * If turned on, this will ensure that all query parameters on the given route
   * are made available under the `queryParams` variable.
   *
   * @default false
   */
  queryParameters: Boolean
}

export const meta = createBuilder('meta', 'metaExtracted')
  .options<Partial<MetaConfig>>()
  .initializer()
  .handler(async (p, o) => {
    // eslint-disable-next-line prefer-const
    let { frontmatter, meta, head } = p
    const c: MetaConfig = {
      metaProps: ['image', 'title', 'description', 'url', 'image_width', 'image_height'],
      routeProps: ['layout', 'requiresAuth'],
      routeNameProp: 'routeName',
      queryParameters: false,
      headProps: ['title'],

      ...o,
    }

    // frontmatter = [
    //   ...Object.keys(c.defaults),
    //   ...Object.keys(frontmatter),
    // ].reduce(
    //   // iterate over all keys defined in page's Frontmatter dictionary
    //   // or defined with a "default value"
    //   (acc, p) => ({ ...acc, [p]: frontmatter[p] || c.defaults[p] }),
    //   {},
    // )
    // if (c.override)
    //   frontmatter = c.override(frontmatter, p.fileName)

    head = {
      ...head,
      ...c?.headProps.reduce(
        (acc, p) => ({ ...acc, [p]: frontmatter[p as string] }),
        {},
      ),
    }

    meta = [
      ...meta,
      ...c.metaProps.reduce(
        (acc, p) => frontmatter[p as string]
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

    const routeName: string | false = c.routeName
      ? c.routeName(p.fileName, p.frontmatter)
      : typeof c.routeNameProp === 'string'
        ? (p.frontmatter[c.routeNameProp] as string | undefined) || false
        : false

    const routeMeta: RouteConfig = {
      ...p.routeMeta,
      ...(routeName ? { name: routeName } : {}),
      ...(c.routePath ? { path: valueOrCallback(c.routePath, [p.fileName, p.frontmatter]) as string } : {}),
      ...(Object.keys(routeMetaProps).length > 0 ? { meta: routeMetaProps } : {}),
    }
    const hasRouteConfig = Object.keys(routeMeta).length > 0 || routeName

    // ROUTE META
    if (hasRouteConfig || o.queryParameters) {
      const router = [
        'import { useRouter, useRoute } from \'vue-router\'',
      ]
      if (o.queryParameters) {
        router.push('const route = useRoute()')
        router.push('const queryParams: Record<string, string|boolean|number> = route.query')
      }

      if (hasRouteConfig) {
        router.push('const router = useRouter()')
        if (routeMeta.name)
          router.push(`router.currentRoute.value.name = ${JSON.stringify(routeMeta.name)}`)

        if (routeMeta.path)
          router.push(`router.currentRoute.value.path = ${JSON.stringify(routeMeta.path)}`)

        if (routeMeta.meta) {
          router.push('router.currentRoute.value.meta = {')
          router.push('  ...router.currentRoute.value.meta,')

          keys(routeMeta.meta).forEach((key) => {
            const value = (routeMeta.meta as Frontmatter)[key]
            if (!Array.isArray(value) && value !== null && typeof value === 'object') {
              // a dictionary of key/values ... most typically associated to the "route" prop
              keys(value as Object).forEach((subKey) => {
                const subValue = ((routeMeta.meta as Frontmatter)[key] as Record<string, any>)[subKey]
                router.push(`  ${subKey}: ${JSON.stringify(subValue)},`)
              })
            }
            else {
              router.push(`  ${key}: ${JSON.stringify(value)},`)
            }
          })

          router.push('}')
        }
      }

      p.addCodeBlock('route-meta', router.join('\n'))
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


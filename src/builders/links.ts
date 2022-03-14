import { join } from 'path'
import { normalizePath } from 'vite'
import type { LinkElement, LinkifyConfig, StringTransformer } from '../types'
import { keys } from '../utils'
import { WithExtras } from './plugins/md-link'

const staticRuleLookup = {
  externalLinkClass: /^https?:/,
  internalLinkClass: /^[a-z\.\/]*[^:]*$/,
  relativeLinkClass: /^[a-z\.]{1}[a-z\.\/]*[^:]*$/,
  fullyQualifiedLinkClass: /^\/[a-z\.]*[^:]*$/,
  anchorTagClass: /^#/,
  insecureClass: /^http:/,
  fileClass: /^file:/,
  mailtoClass: /^mailto:/,
  imageClass: /\.(gif|jpg|jpeg|png|webp|avif|tiff|heif)$/,
  documentClass: /\.(doc|pdf|txt|xls)$/,
}

function isExternalLink(meta: LinkElement): meta is LinkElement & { href: string } {
  return !!(meta.href && staticRuleLookup.externalLinkClass.test(meta.href))
}
function isInternalLink(meta: LinkElement): meta is LinkElement & { href: string } {
  return !!(meta.href && staticRuleLookup.internalLinkClass.test(meta.href))
}

function transform(transformer: string | StringTransformer | undefined, meta: LinkElement): string | undefined {
  if (!transformer)
    return undefined
  else if (typeof transformer === 'function')
    return transformer(meta)
  else
    return transformer
}

/** returns an array of classes based on the URL and configuration */
const addClasses = (c: LinkifyConfig) =>
/** returns an array of classes based on the URL and configuration */
  (meta: WithExtras<LinkElement>): WithExtras<LinkElement> => {
    const classes = keys(staticRuleLookup)
      .flatMap((key) => {
        if (!meta.href || !staticRuleLookup[key].test(meta.href))
          return undefined

        switch (typeof c[key]) {
          case 'function':
            return (c[key] as StringTransformer)(meta)
          case 'string':
            return c[key] as string
          case 'undefined':
            return undefined
          default:
            throw new Error(`Unexpected property type for property ${key} [${typeof c[key]}]`)
        }
      })
      // remove undefined values
      .filter(i => i) as string[]

    if (meta.href) {
      c.ruleBasedClasses.forEach((rc) => {
        const [rule, klass] = rc
        if (rule.test(meta.href as string))
          meta.class = [meta.class, klass].join(' ')
      })
    }

    return { ...meta, class: [meta.class, ...classes].join(' ') }
  }

/** adds "target" and "rel" properties to links */
const addTargetingAndRel = (c: LinkifyConfig) =>
/** adds "target" and "rel" properties to links */
  (meta: WithExtras<LinkElement>): WithExtras<LinkElement> => {
    if (isExternalLink(meta)) {
      meta.target = transform(c.externalTarget, meta)
      meta.rel = transform(c.externalRel, meta)
    }
    if (isInternalLink(meta)) {
      meta.target = transform(c.internalTarget, meta)
      meta.rel = transform(c.internalRel, meta)
    }

    return meta
  }

/** works on URL structure and messages based on config */
const cleanupAndCloseOut = (c: LinkifyConfig) =>
/** works on URL structure and messages based on config */
  (meta: WithExtras<LinkElement>): WithExtras<LinkElement> => {
    if (isInternalLink(meta)) {
      if (meta.href && meta.href.trim().endsWith('index.md') && c.cleanIndexRoutes)
        meta.href = meta.href.replace(/index\.md\s*/, '')
      else if (meta.href && meta.href.trim().endsWith('.md') && c.cleanAllRoutes)
        meta.href = meta.href.replace(/(\S+)\.md$/, '$1')

      const removal = new RegExp(`.*${c.rootDir}`)
      // meta['data-removal'] = String(removal)
      if (isInternalLink(meta))
        meta.href = normalizePath(join(meta._base.replace(removal, ''), meta.href))

      if (meta.tagName === 'a' && c.useRouterLinks) {
        meta = {
          ...meta,
          to: meta.href,
          href: undefined,
          tagName: 'router-link',
          class: [meta.class, c.routerLinkClass].join(' '),
        }
      }
    }

    return meta
  }

/**
 * Provides a well formed _link_ plugin
 * which has sensible defaults but still provides
 * a strong amount of configuration control.
 */
export function link(config: Partial<LinkifyConfig> = {}) {
  const c: LinkifyConfig = {
    rootDir: 'src/pages',
    externalLinkClass: 'external-link',
    internalLinkClass: 'internal-link',
    routerLinkClass: 'router-link',
    relativeLinkClass: undefined,
    fullyQualifiedLinkClass: undefined,
    anchorTagClass: 'anchor-tag',
    insecureClass: 'insecure',
    fileClass: 'file-link',
    mailtoClass: 'mailto-link',
    imageClass: 'image-reference',
    documentClass: 'doc-reference',
    ruleBasedClasses: [],
    externalTarget: '_blank',
    externalRel: 'noreferrer noopenner',
    internalTarget: undefined,
    internalRel: undefined,
    useRouterLinks: true,
    cleanIndexRoutes: true,
    cleanAllRoutes: true,
    postProcessing: f => f,

    ...config,
  }
  return (meta: WithExtras<LinkElement>) => {
    const [cleanup, targetting, classes] = [cleanupAndCloseOut(c), addTargetingAndRel(c), addClasses(c)]
    return c.postProcessing(cleanup(targetting(classes(meta))))
  }
}

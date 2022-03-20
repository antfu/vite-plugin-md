import { join } from 'path'
import { pipe } from 'fp-ts/lib/function'
import { normalizePath } from 'vite'
import type { LinkElement } from '../../@types'
import { keys } from '../../utils'
import { createBuilder } from '../createBuilder'
import type { LinkTransformer, LinkifyConfig, StringTransformer } from './link-types'
import type { WithTagAndBase } from './md-link'
import MdLink from './md-link'

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

function strTransform(transformer: string | StringTransformer | undefined, meta: WithTagAndBase<LinkElement>): string | undefined {
  if (!transformer)
    return undefined
  else if (typeof transformer === 'function')
    return transformer(meta)
  else
    return transformer
}

/** returns an array of classes based on the URL and configuration */
const addClasses = (c: LinkifyConfig): LinkTransformer =>
/** returns an array of classes based on the URL and configuration */
  (lnk) => {
    const classes = keys(staticRuleLookup)
      .flatMap((key) => {
        if (!lnk.href || !staticRuleLookup[key].test(lnk.href))
          return undefined

        switch (typeof c[key]) {
          case 'function':
            return (c[key] as StringTransformer)(lnk)
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

    if (lnk.href) {
      c.ruleBasedClasses.forEach((rc) => {
        const [rule, klass] = rc
        if (rule.test(lnk.href as string))
          lnk.class = [lnk.class, klass].join(' ')
      })
    }

    return { ...lnk, class: [lnk.class, ...classes].join(' ') }
  }

/** adds "target" and "rel" properties to links */
const addTargetingAndRel = (c: LinkifyConfig): LinkTransformer =>
/** adds "target" and "rel" properties to links */
  (lnk) => {
    if (isExternalLink(lnk)) {
      lnk.target = strTransform(c.externalTarget, lnk)
      lnk.rel = strTransform(c.externalRel, lnk)
    }
    if (isInternalLink(lnk)) {
      lnk.target = strTransform(c.internalTarget, lnk)
      lnk.rel = strTransform(c.internalRel, lnk)
    }

    return lnk
  }

/** works on URL structure and messages based on config */
const cleanupAndCloseOut = (c: LinkifyConfig): LinkTransformer =>
/** works on URL structure and messages based on config */
  (lnk) => {
    if (isInternalLink(lnk)) {
      if (lnk.href && lnk.href.trim().endsWith('index.md') && c.cleanIndexRoutes)
        lnk.href = lnk.href.replace(/index\.md\s*/, '')
      else if (lnk.href && lnk.href.trim().endsWith('.md') && c.cleanAllRoutes)
        lnk.href = lnk.href.replace(/(\S+)\.md$/, '$1')

      const removal = new RegExp(`.*${c.rootDir}`)
      // meta['data-removal'] = String(removal)
      if (isInternalLink(lnk))
        lnk.href = normalizePath(join(lnk._base.replace(removal, ''), lnk.href))

      if (lnk.tagName === 'a' && c.useRouterLinks) {
        lnk = {
          ...lnk,
          to: lnk.href,
          href: undefined,
          tagName: 'router-link',
          class: [lnk.class, c.routerLinkClass].join(' '),
        }
      }
    }

    return lnk
  }

/**
 * A _builder_ which provides:
 * - contextual classes to links within Markdown pages
 *    - relative versus absolute links
 *    - local versus external links
 *    - content-type based links
 *    - protocol based links (http/file/mailto)
 * - cleans up _relative_ links relative nature based
 * on current route
 * - converts `<a href>` properties to `<router-link to>` props
 * - `postProcessing` hook to allow programatic mutation
 * beyond the core use-cases
 */
export const link = createBuilder('link', 'parser')
  .options<Partial<LinkifyConfig>>()
  .initializer()
  // the approach for this builder is to inject a rule into the MarkdownIt
  // which will call our `transform` function on each instance of a link element
  // discovered and allow mutation.
  .handler((p, o) => {
    const { fileName, viteConfig: { base } } = p
    // merge default settings with user settings
    const options: LinkifyConfig = {
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

      ...o,
    }

    const [cleanup, targetting, classes] = [
      cleanupAndCloseOut(options),
      addTargetingAndRel(options),
      addClasses(options),
    ]

    const { postProcessing } = options

    const transform: LinkTransformer = (event: WithTagAndBase<LinkElement>) => {
      return pipe(
        event,

        classes,
        targetting,
        cleanup,
        postProcessing,
      )
    }

    // once we pass our rule into the parser
    // we will get the callback's to our transformer
    // in order to fulfill our goals
    p.parser.use(MdLink({ file: fileName, transform, base }))

    return p
  })
  .meta({
    description: 'provides default classes for all links based on protocol, content-type, and whether internal or external; also converts <a> tags to <router-links> and cleans up relative paths.',
    parserRules: [
      { ruleName: 'link_open', usage: 'patches', description: 'allows attributes to modified on link DOM elements, including changing the tag\'s name from <a> to <router-link>' },
      { ruleName: 'link_close', usage: 'patches', description: 'used to make sure end tag has a matching tag name to start tag' },
    ],
  })

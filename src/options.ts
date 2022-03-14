import { toArray } from '@antfu/utils'
import { preprocessHead } from './head'
import type { Frontmatter, Options, ResolvedOptions } from './types'
import { getVueVersion } from './utils'

export function resolveOptions(userOptions: Options = {}): ResolvedOptions {
  const defaultOptions: Omit<ResolvedOptions, 'frontmatterPreprocess'> = {
    headEnabled: false,
    headField: '',
    frontmatter: true,
    include: null,
    exclude: null,
    excerpt: false,
    exposeFrontmatter: true,
    exposeExcerpt: false,
    escapeCodeTagInterpolation: true,
    customSfcBlocks: ['route', 'i18n', 'style'],
    markdownItOptions: {},
    markdownItUses: [],
    markdownItSetup: () => {},
    grayMatterOptions: {},
    wrapperComponent: null,
    linkTransforms: f => f,
    linkifyLookup: {},
    transforms: {},
    vueVersion: userOptions.vueVersion || getVueVersion(),
    wrapperClasses: 'markdown-body',
  }
  const options = userOptions.frontmatterPreprocess
    ? { ...defaultOptions, ...userOptions }
    : {
      ...defaultOptions,
      ...userOptions,
      frontmatterPreprocess: (frontmatter: Frontmatter, options: ResolvedOptions) => {
        const head = preprocessHead(frontmatter, options)
        return { head, frontmatter }
      },
    }

  options.wrapperClasses = toArray(options.wrapperClasses)
    .filter((i?: string) => i)
    .join(' ')

  return options as ResolvedOptions
}

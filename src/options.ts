import { toArray } from '@antfu/utils'
import { preprocessHead } from './head'
import type { Frontmatter, Options, ResolvedOptions } from './types'
import { getVueVersion } from './utils'

export function resolveOptions(userOptions: Omit<Options, 'usingBuilder'> = {}): ResolvedOptions {
  const defaultOptions: Omit<ResolvedOptions, 'frontmatterPreprocess' | 'usingBuilder'> = {
    builders: [],
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
    markdownItSetup: () => { },
    grayMatterOptions: {},
    wrapperComponent: null,
    transforms: {},
    vueVersion: userOptions.vueVersion || getVueVersion(),
    wrapperClasses: 'markdown-body',
  }
  const options = userOptions.frontmatterPreprocess === null
    ? { ...defaultOptions, ...userOptions }
    : {
        ...defaultOptions,
        ...userOptions,
        usingBuilder: (name: string) => {
          return !options.builders.every(b => b().name !== name)
        },
        frontmatterPreprocess: (frontmatter: Frontmatter, options: ResolvedOptions) => {
        // default process; will be removed if using links() builder
          const head = preprocessHead(frontmatter, options)
          return { head, frontmatter }
        },
      }

  options.wrapperClasses = toArray(options.wrapperClasses)
    .filter((i?: string) => i)
    .join(' ')

  return options as ResolvedOptions
}

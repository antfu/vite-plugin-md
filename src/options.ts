import { toArray } from '@antfu/utils'
import { preprocessHead } from './head'
import type { Frontmatter, Options, ResolvedOptions } from './types'
import { getVueVersion } from './utils'

export function resolveOptions(userOptions: Omit<Options, 'usingBuilder'> = {}): ResolvedOptions {
  const defaultOptions: Omit<ResolvedOptions, 'frontmatterPreprocess' | 'usingBuilder'> = {
    style: {
      baseStyle: 'none',
    },
    builders: [],
    headEnabled: false,
    headField: '',
    frontmatter: true,
    frontmatterDefaults: {},
    frontmatterOverrides: {},
    include: null,
    exclude: null,
    excerpt: false,
    excerptExtract: false,
    exposeFrontmatter: true,
    exposeExcerpt: true,
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
    ? {
        ...defaultOptions,
        ...userOptions,
        style: {
          ...defaultOptions.style,
          ...userOptions.style,
        },
      }
    : {
        ...defaultOptions,
        ...userOptions,
        style: {
          ...defaultOptions.style,
          ...userOptions.style,
        },
        usingBuilder: (name: string) => {
          return !options.builders.every(b => b().name !== name)
        },
        frontmatterPreprocess: (frontmatter: Frontmatter, options: ResolvedOptions) => {
          if (!options.usingBuilder('link')) {
            // the link handler will manage this independently and as part of the
            // builder pipeline
            const head = preprocessHead(frontmatter, options)
            return { head, frontmatter }
          }
        },
      }

  options.wrapperClasses = toArray(options.wrapperClasses)
    .filter((i?: string) => i)
    .join(' ')

  return options as ResolvedOptions
}

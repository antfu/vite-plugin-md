import { toArray } from '@antfu/utils'
import { preprocessHead } from './head'
import type { Options, ResolvedOptions } from './types'
import { getVueVersion } from './utils'

export function resolveOptions(userOptions: Options): ResolvedOptions {
  const options = Object.assign({
    headEnabled: false,
    headField: '',
    frontmatter: true,
    excerpt: false,
    exposeFrontmatter: true,
    exposeExcerpt: false,
    escapeCodeTagInterpolation: true,
    customSfcBlocks: ['route', 'i18n', 'style'],
    markdownItOptions: {},
    markdownItUses: [],
    markdownItSetup: () => {},
    grayMatterOptions: {},
    wrapperClasses: 'markdown-body',
    wrapperComponent: null,
    transforms: {},
    frontmatterPreprocess: (frontmatter: any, options: ResolvedOptions) => {
      const head = preprocessHead(frontmatter, options)
      return { head, frontmatter }
    },
  }, userOptions) as ResolvedOptions

  options.wrapperClasses = toArray(options.wrapperClasses).filter(i => i).join(' ')
  options.vueVersion = options.vueVersion || getVueVersion()

  return options
}

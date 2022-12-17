import { toArray } from '@antfu/utils'

import type { Options, ResolvedOptions, ToBuilder } from './types'
import { getVueVersion } from './utils'

export function resolveOptions<
  O extends Options<readonly any[]>,
>(userOptions: Partial<O>) {
  const options = {
    style: {
      baseStyle: 'none',
    },
    builders: (
      userOptions?.builders
        ? userOptions.builders
        : []
    ),
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
    vueVersion: userOptions?.vueVersion || getVueVersion(),
    wrapperClasses: 'markdown-body',

    ...userOptions,
    usingBuilder: (name: string) => {
      return !options.builders.every(b => b.about.name !== name)
    },

  }

  options.wrapperClasses = toArray(options.wrapperClasses)
    .filter((i?: string) => i)
    .join(' ')

  return options as unknown as ResolvedOptions<ToBuilder<O['builders']>>
}

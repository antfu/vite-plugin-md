import { toArray } from '@antfu/utils'
import meta from '@yankeeinlondon/meta-builder'

// import meta from '@yankeeinlondon/meta-builder'
import type { BuilderFrom, GenericBuilder, Options, ResolvedOptions, ToBuilder } from '../types'
import { getVueVersion, warn } from '../utils'
import { replaceBuilderOption } from '../utils/replaceBuilder'

/**
 * Receives a _partial_ set of Options and completes the `Options` type
 * and then adds a few additional properties to complete the `ResolvedOption`.
 *
 * During this process it will also ensure that the `meta-builder` is included
 * and if a user has manually added it, to remove it and warn on CLI.
 */
export function resolveOptions<
  O extends Partial<Options<readonly any[] | readonly[]>>,
>(userOptions: O) {
  type Builder = BuilderFrom<O>

  const defaultOptions: Options<Builder> = {
    meta: {
      metaProps: [],
      routeMetaProps: [],
    },
    style: {
      baseStyle: userOptions?.style?.baseStyle || 'none',
    },
    getFinalizedReport: null,
    mutateParsed: null,
    mutateSfcBlocks: null,
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
    customSfcBlocks: ['i18n'],
    removeSfcBlocks: ['i18n'],
    markdownItOptions: {},
    markdownItUses: [],
    grayMatterOptions: {},
    wrapperComponent: null,
    vueVersion: userOptions?.vueVersion || getVueVersion(),
    wrapperClasses: userOptions?.wrapperClasses || 'markdown-body',
    builders: (userOptions?.builders || []) as ToBuilder<BuilderFrom<O>>,
  }

  const options: ResolvedOptions<Builder> = {
    ...defaultOptions,
    ...userOptions,
    wrapperClasses: toArray(userOptions?.wrapperClasses || 'markdown-body')
      .filter((i?: string) => i)
      .join(' '),
    usingBuilder: (name: string) => {
      return !options.builders.every(<B extends GenericBuilder>(b: B) => b.about.name !== name)
    },
    ...userOptions,
    style: {
      baseStyle: userOptions?.style?.baseStyle || 'none',
    },
    builders: (
      userOptions?.builders
        ? userOptions.builders
        : []
    ) as Builder,
  }

  // meta-builder is now being included by default
  if (options.usingBuilder('meta')) {
    // since it appears that it was also included
    // we will raise a warning but use it as configured
    warn('builder-api', 'You are using the "meta-builder" manually as part of your "builders" configuration. This is no longer necessary as it is automatically included as part of vite-plugin-md. You will find that all of this builder\'s options now found under "meta" property in the options hash.')
  }

  const metaBuilder = meta(options.meta)

  return replaceBuilderOption(options, metaBuilder)
}

import { flow, pipe } from 'fp-ts/lib/function.js'
import { isRight } from 'fp-ts/lib/Either.js'

import { resolveOptions } from './options'
import type {
  GenericBuilder,
  Options,
  Pipeline,
  ViteConfigPassthrough,
} from './types'
import {
  applyMarkdownItOptions,
  baseStyling,
  convertToDom,
  createParser,
  escapeCodeTagInterpolation,
  extractBlocks,
  extractFrontmatter,
  finalize,
  frontmatterPreprocess,
  gatherBuilderEvents,
  loadMarkdownItPlugins,
  parseHtml,
  repairFrontmatterLinks,
  sourcemap,
  transformsBefore,
  wrapHtml,
} from './pipeline'
import { lift } from './utils'
import { MdError } from './MdError'
import { kebabCaseComponents } from './pipeline/kebabCaseComponents'

/**
 * Composes the `template` and `script` blocks, along with any other `customBlocks` from
 * the raw markdown content along with user options.
 */
export async function composeSfcBlocks<
  B extends readonly GenericBuilder[] = [],
>(
  id: string,
  raw: string,
  opts: Options<B> = {} as Options<B>,
  config: Partial<ViteConfigPassthrough> = {},
) {
  const options = resolveOptions(opts)

  /**
   * The initial pipeline state
   */
  const payload: Pipeline<'initialize', B> = {
    stage: 'initialize',
    fileName: id,
    content: raw.trimStart(),
    head: {},
    frontmatter: undefined,
    routeMeta: undefined,
    viteConfig: config,
    vueStyleBlocks: {},
    vueCodeBlocks: {},
    codeBlockLanguages: {
      langsRequested: [],
      langsUsed: [],
    },
    options,
  }

  const handlers = gatherBuilderEvents(options)

  /** initialize the configuration */
  const initialize = flow(
    // lifted,
    transformsBefore<B>(),
    handlers('initialize'),
  )

  /** extract the meta-data from the MD content */
  const metaExtracted = flow(
    extractFrontmatter<B>(),
    baseStyling<B>(),
    frontmatterPreprocess<B>(),
    handlers('metaExtracted'),
  )

  /** establish the MarkdownIt parser */
  const parser = flow(
    createParser<B>(),
    loadMarkdownItPlugins<B>(),
    applyMarkdownItOptions<B>(),
    handlers('parser'),
  )

  /**
   * use MarkdownIt to produce HTML
   */
  const parsed = flow(
    parseHtml<B>(),
    kebabCaseComponents<B>(),
    repairFrontmatterLinks<B>(),
    wrapHtml<B>(),
    handlers('parsed'),
  )

  /**
   * Convert HTML to DOM structure to make certain mutations
   * easier to perform.
   */
  const dom = flow(
    convertToDom<B>(),
    escapeCodeTagInterpolation<B>(),
    handlers('dom'),
  )

  // construct the async pipeline
  const result = await pipe(
    lift(payload),

    initialize,
    metaExtracted,
    parser,
    parsed,

    dom,
    extractBlocks<B>(),
    handlers('sfcBlocksExtracted'),

    finalize<B>(),
    sourcemap<B>(),
    handlers('closeout'),
  )()

  if (isRight(result))
    return result.right
  else
    throw new MdError(result.left)
}

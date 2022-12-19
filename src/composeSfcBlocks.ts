import { flow, pipe } from 'fp-ts/lib/function.js'
import { isRight } from 'fp-ts/lib/Either.js'

import { resolveOptions } from './pipeline/resolveOptions'
import type {
  BuilderFrom,
  Options,
  Pipeline,
  ViteConfigPassthrough,
} from './types'
import {
  baseStyling,
  convertToDom,
  createParser,
  escapeCodeTagInterpolation,
  extractBlocks,
  extractFrontmatter,

  finalize,
  gatherBuilderEvents,
  getFinalizedReportHook,
  loadMarkdownItPlugins,
  mutateParsed,
  mutateSfcBlocks,
  parseHtml,
  repairFrontmatterLinks,
  sourcemap,
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
  O extends Partial<Options<readonly any[] | readonly []>> = Partial<Options<readonly []>>,
>(
  id: string,
  raw: string,
  opts: O = {} as O & Partial<Options<readonly []>>,
  config: Partial<ViteConfigPassthrough> = {} as Partial<ViteConfigPassthrough>,
) {
  const options = resolveOptions(opts)
  type Builder = BuilderFrom<typeof options>

  /**
   * The initial pipeline state
   */
  const payload: Pipeline<'initialize', Builder> = {
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

  const handlers = gatherBuilderEvents<Builder>(options as any)

  /** initialize the configuration */
  const initialize = flow(
    handlers('initialize'),
  )

  /** extract the meta-data from the MD content */
  const metaExtracted = flow(
    extractFrontmatter<Builder>(),
    baseStyling<Builder>(),
    // meta-builder
    handlers('metaExtracted'),
  )

  /** establish the MarkdownIt parser */
  const parser = flow(
    createParser<Builder>(),
    loadMarkdownItPlugins<Builder>(),
    handlers('parser'),
  )

  /**
   * use MarkdownIt to produce HTML
   */
  const parsed = flow(
    parseHtml<Builder>(),
    kebabCaseComponents<Builder>(),
    repairFrontmatterLinks<Builder>(),
    wrapHtml<Builder>(),
    handlers('parsed'),
    mutateParsed<Builder>(),
  )

  /**
   * Convert HTML to DOM structure to make certain mutations
   * easier to perform.
   */
  const dom = flow(
    convertToDom<Builder>(),
    escapeCodeTagInterpolation<Builder>(),
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

    extractBlocks<Builder>(),
    handlers('sfcBlocksExtracted'),
    mutateSfcBlocks<Builder>(),

    finalize<Builder>(),
    sourcemap<Builder>(),
    handlers('closeout'),
    getFinalizedReportHook<Builder>(),
  )()

  if (isRight(result))
    return result.right
  else
    throw new MdError(result.left)
}

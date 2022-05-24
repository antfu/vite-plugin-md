import { flow, pipe } from 'fp-ts/lib/function'
import { isRight } from 'fp-ts/lib/Either'
import { resolveOptions } from '../options'
import { PipelineStage } from '../types'
import type {
  Options,
  Pipeline,
  ViteConfigPassthrough,
} from '../types'
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
  transformsBefore,
  wrapHtml,
} from '../pipeline'
import { lift } from '../utils'
import { MdError } from '../MdError'

/**
 * Composes the `template` and `script` blocks, along with any other `customBlocks` from
 * the raw markdown content along with user options.
 */
export async function composeSfcBlocks(id: string, raw: string, opts: Omit<Options, 'usingBuilder'> = {}, config: Partial<ViteConfigPassthrough> = {}) {
  const options = resolveOptions(opts)
  /**
   * The initial pipeline state
   */
  const payload: Pipeline<PipelineStage.initialize> = {
    fileName: id,
    content: raw.trimStart(),
    head: {},
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
    lift('initialize'),
    transformsBefore,
    handlers(PipelineStage.initialize),
  )

  /** extract the meta-data from the MD content */
  const metaExtracted = flow(
    extractFrontmatter,
    baseStyling,
    frontmatterPreprocess,
    handlers(PipelineStage.metaExtracted),
  )

  /** establish the MarkdownIt parser */
  const parser = flow(
    createParser,
    loadMarkdownItPlugins,
    applyMarkdownItOptions,
    handlers(PipelineStage.parser),
  )

  /**
   * use MarkdownIt to produce HTML
   */
  const parsed = flow(
    parseHtml,
    repairFrontmatterLinks,
    wrapHtml,
    handlers(PipelineStage.parsed),
  )

  /**
   * Convert HTML to DOM structure to make certain mutations
   * easier to perform.
   */
  const dom = flow(
    convertToDom,
    escapeCodeTagInterpolation,
    handlers(PipelineStage.dom),
  )

  // TODO: broken into "flow groups" defined above because it would
  // appear that fp-ts _typing_ breaks down after some set number
  // of steps ... actually prefer a single list so might be worth
  // investigating whether there's a way to work around

  // construct the async pipeline
  const result = await pipe(
    payload,

    initialize,
    metaExtracted,
    parser,
    parsed,

    dom,
    extractBlocks,
    handlers(PipelineStage.sfcBlocksExtracted),

    finalize,
    handlers(PipelineStage.closeout),
  )()

  if (isRight(result))
    return result.right
  else
    throw new MdError(result.left)
}

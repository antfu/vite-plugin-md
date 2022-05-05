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
    options,
    viteConfig: config,
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
    throw new Error(result.left)
}

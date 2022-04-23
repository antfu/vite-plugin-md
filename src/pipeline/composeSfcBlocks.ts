import { pipe } from 'fp-ts/lib/function'
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
 * Composes the `template` and `script` blocks, along with any other `customBlocks` from the raw
 * markdown content along with user options.
 */
export async function composeSfcBlocks(id: string, raw: string, opts: Options = {}, config: Partial<ViteConfigPassthrough> = {}) {
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

  // construct the async pipeline
  const result = await pipe(
    payload,
    lift('initialize'),
    transformsBefore,

    handlers(PipelineStage.initialize),

    extractFrontmatter,
    frontmatterPreprocess,
    handlers(PipelineStage.metaExtracted),

    createParser,
    loadMarkdownItPlugins,
    applyMarkdownItOptions,
    handlers(PipelineStage.parser),

    parseHtml,
    repairFrontmatterLinks,
    wrapHtml,
    escapeCodeTagInterpolation,
    handlers(PipelineStage.parsed),

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

import { identity, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { isRight } from 'fp-ts/lib/Either'
import { resolveOptions } from '../options'
import { PipelineStage } from '../types'
import type {
  Options,
  PipeTask,
  Pipeline,
  ViteConfigPassthrough,
} from '../types'
import {
  applyMarkdownItOptions,
  gatherBuilderEvents,
  createParser,
  // builderToTask,
  escapeCodeTagInterpolation,
  extractBlocks,
  extractFrontmatter,
  finalize,
  frontmatterPreprocess,
  loadMarkdownItPlugins,
  parseHtml,
  transformsAfter,
  transformsBefore,
  wrapHtml,
} from '../pipeline'
import { lift } from '../utils'

type t = typeof transformsBefore

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
  const x = handlers('closeout')

  // construct the async pipeline
  const result = pipe(
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
    wrapHtml,
    escapeCodeTagInterpolation,
    handlers(PipelineStage.parsed),

    extractBlocks,
    handlers(PipelineStage.sfcBlocksExtracted),

    finalize,
    transformsAfter,
    handlers(PipelineStage.closeout),
  )

  // run the pipeline
  // const pipeline = await result()
  // console.log({pipeline});

  if (isRight(result))
    return result.right
  else
    throw new Error(result.left as string)
}

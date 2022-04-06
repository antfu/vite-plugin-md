import { flow, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { isRight } from 'fp-ts/lib/Either'
import { resolveOptions } from '../options'
import {
  PipelineStage,
} from '../types'
import type {
  Options,
  Pipeline,
  ViteConfigPassthrough,
} from '../types'
import {
  applyMarkdownItOptions,
  callEventHooks,
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

  /** Builder handler functions for the given lifecycle stage */
  const handlers = callEventHooks(options)

  // construct the async pipeline
  const result = pipe(
    payload,

    transformsBefore,
    handlers(PipelineStage.initialize),

    TE.map(
      flow(
        extractFrontmatter,
        frontmatterPreprocess,
      ),
    ),
    handlers(PipelineStage.metaExtracted),

    TE.map(
      flow(
        createParser,
        loadMarkdownItPlugins,
        applyMarkdownItOptions,
      ),
    ),
    handlers(PipelineStage.parser),

    TE.map(
      flow(
        parseHtml,
        wrapHtml,
        escapeCodeTagInterpolation,
      ),
    ),
    handlers(PipelineStage.parsed),

    TE.map(extractBlocks),
    handlers(PipelineStage.sfcBlocksExtracted),

    TE.map(
      flow(
        finalize,
        transformsAfter,
      ),
    ),
    handlers(PipelineStage.closeout),
  )

  // run the pipeline
  const pipeline = await result()

  if (isRight(pipeline))
    return pipeline.right
  else
    throw new Error(pipeline.left)
}

import { pipe } from 'fp-ts/lib/function'
import { resolveOptions } from '../options'
import { PipelineStage } from '../@types'
import type {
  BuilderConfig,
  BuilderOptions,
  BuilderRegistration,
  IPipelineStage,
  Options,
  Pipeline,
  ViteConfigPassthrough,
} from '../@types'
import {
  applyMarkdownItOptions,
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
import { createParser } from './createParser'

/**
 * Composes the `template` and `script` blocks, along with any other `customBlocks` from the raw
 * markdown content along with user options.
 */
export function composeSfcBlocks(id: string, raw: string, opts: Options = {}, config: Partial<ViteConfigPassthrough> = {}) {
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

  // store all builders into event structure
  const builders = options.builders.reduce(
    (acc, b) => {
      const defn = b() as BuilderRegistration<BuilderOptions, IPipelineStage>
      const current = acc[defn.lifecycle]
      return {
        ...acc,
        [defn.lifecycle]: current
          ? [...current, { handler: defn.handler, options: defn.options }]
          : [{ handler: defn.handler, options: defn.options }],
      }
    },
    {} as BuilderConfig,
  )

  /**
   * Allow any builders which have attached to the given lifecycle hook
   * to participate in the pipeline
   */
  const callEventHooks = <S extends PipelineStage>(stage: S) => (payload: Pipeline<S>): Pipeline<S> => {
    for (const b of builders[stage] || [])
      payload = b.handler(payload, b.options) as Pipeline<S>

    return payload
  }

  // run the pipeline
  const result = pipe(
    payload,

    transformsBefore,
    callEventHooks(PipelineStage.initialize),

    extractFrontmatter,
    frontmatterPreprocess,
    callEventHooks(PipelineStage.metaExtracted),

    createParser,
    loadMarkdownItPlugins,
    applyMarkdownItOptions,
    callEventHooks(PipelineStage.parser),

    parseHtml,
    wrapHtml,
    escapeCodeTagInterpolation,
    callEventHooks(PipelineStage.parsed),

    extractBlocks,
    callEventHooks(PipelineStage.sfcBlocksExtracted),

    finalize,
    transformsAfter,
    callEventHooks(PipelineStage.closeout),
  )

  return result
}

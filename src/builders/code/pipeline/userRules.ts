import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../code-types'

/**
 * Provides a before/after hook that consumers can use to tie into the
 * mutation pipeline for `code()` builder
 */
export const userRules = <
  W extends 'before' | 'after',
>(when: W, p: Pipeline<PipelineStage.parser>, o: CodeOptions) =>
    (fence: CodeBlockMeta<W extends 'before' ? 'code' : 'dom'>) => {
      return (o[when]
        ? o[when]((fence as CodeBlockMeta<any>), p, o)
        : fence) as CodeBlockMeta<W extends 'before' ? 'code' : 'dom'>
    }

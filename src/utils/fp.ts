import * as E from 'fp-ts/lib/Either.js'
import { flatten, map, tryCatch } from 'fp-ts/lib/TaskEither.js'
import { pipe } from 'fp-ts/lib/function.js'

import type { GenericBuilder, PipeEither, PipeTask, Pipeline, PipelineStage } from '../types'

/**
 * Allows a synchronous function to be lifted up to becoming a task
 * where the generic `B` is maintained but the "from" and "to" params
 * allow moving through stages of the pipeline
 */
export const transformer = <
B extends readonly GenericBuilder[]>() => <F extends PipelineStage, T extends PipelineStage>(
    from: F,
    fn: (p: Pipeline<F, B>) => Pipeline<T, B>,
  ) =>
      (payload: PipeTask<F, B>): PipeTask<T, B> => pipe(
        payload,
        map(
          p => tryCatch(
            () => {
              const result = Promise.resolve(fn(p))
              return result
            },
            (e) => {
              return `Problem encountered during the "${p.stage}" stage of the vite-plugin-md transform pipeline:\n\n  ${e instanceof Error ? `${e.message}\n\n${e.stack}` : String(e)}`
            },
          ),
        ),
        flatten,
      )

export function isPipeTask<
  S extends PipelineStage,
  B extends readonly GenericBuilder[],

>(payload: PipeTask<S, B> | PipeEither<S, B>): payload is PipeTask<S, B> {
  return typeof payload === 'function'
}

/**
 * Given either a `PipeTask<S>` or `PipeEither<S>`, will return a `PipeTask<S>`
 */
export const liftToAsync = <
  S extends PipelineStage,
  B extends readonly GenericBuilder[],
>(payload: PipeTask<S, B > | PipeEither<S, B>): PipeTask<S, B> => {
  return isPipeTask(payload)
    ? payload
    : () => Promise.resolve(payload)
}

/**
 * Lifts a `Pipeline<S>` to a `PipeTask<S>`
 * ```ts
 * const task = lift(pipeline);
 * ```
 */
export const lift = <
  S extends PipelineStage,
  B extends readonly GenericBuilder[],
>(payload: Pipeline<S, B>): PipeTask<S, B> =>
    () => Promise.resolve(E.right(payload))

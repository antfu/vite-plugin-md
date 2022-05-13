import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'

import type { IPipelineStage, PipeEither, PipeTask, Pipeline, PipelineStage } from '../types'

/**
 * Allows a synchronous function:
 * ```ts
 * declare function fn = (p: Pipeline<F>) => Pipeline<T>
 * ```
 *
 * To be lifted up to becoming a Task:
 * ```ts
 * declare function task = (P: PipeTask<F>) => PipeTask<T>
 * ```
 */
export const transformer = <F extends IPipelineStage, T extends IPipelineStage>(
  name: string,
  from: F,
  to: T,
  fn: (p: Pipeline<F>) => Pipeline<T>,
) => (payload: PipeTask<F>): PipeTask<T> => pipe(
    payload,
    TE.map(
      p => TE.tryCatch(
        () => {
          const result = Promise.resolve(fn(p))
          return result
        },
        (e) => {
          return `Problem encountered during the "${name}" stage of the vite-plugin-md transform pipeline:\n\n  ${e instanceof Error ? `${e.message}\n\n${e.stack}` : String(e)}`
        },
      ),
    ),
    TE.flatten,
  )

export function isPipeTask<S extends IPipelineStage>(payload: PipeTask<S> | PipeEither<S>): payload is PipeTask<S> {
  return typeof payload === 'function'
}

/**
 * Given either a `PipeTask<S>` or `PipeEither<S>`, will return a `PipeTask<S>`
 */
export const liftToAsync = <S extends PipelineStage>(payload: PipeTask<S> | PipeEither<S>): PipeTask<S> => {
  return isPipeTask(payload)
    ? payload
    : () => Promise.resolve(payload)
}

/**
 * Lifts a `Pipeline<S>` to a `PipeTask<S>`
 * ```ts
 * const pipeline = pipe(
 *    payload,
 *    lift('initialize'),
 *    // TaskEither transforms
 * )
 * ```
 */
export const lift = <S extends IPipelineStage>(_: S) =>
  (payload: Pipeline<S>): PipeTask<S> =>
    () => Promise.resolve(E.right(payload))

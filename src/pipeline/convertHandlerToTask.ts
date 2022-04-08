import { flow, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import { tryCatch } from 'fp-ts/TaskEither'
import type { AsyncPipelineTransformer, BuilderConfig, BuilderOptions, BuilderRegistration, IPipelineStage, PipeTask, Pipeline, PipelineStage, ResolvedOptions } from '../types'

const getBuilders = <S extends IPipelineStage>(stage: S, options: ResolvedOptions): Array<BuilderRegistration<any, S>> => options.builders.reduce(
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
)[stage] || [] as Array<BuilderRegistration<any, S>>

/**
 * Provides back a function which converts the payload for a given lifecycle stage --
 * a `Pipeline<S>` -- and returns a `TaskEither<string, Pipeline<S>` which represents
 * _either_ an error condition (as string) or the mutated pipeline state after all
 * builder API's for that stage have been executed
 *
 * ```ts
 * const fn: (p: Pipeline<S>): TE.TaskEither<string, Pipeline<S>>
 *  = transformForBuilders(stage)
 * ```
 */
export const getBuilderTasks = <S extends IPipelineStage>(
  stage: S,
  options: ResolvedOptions,
) => (payload: Pipeline<S>) => {
  const builders = getBuilders(stage, options)
  if (builders.length === 0) {
    // if no builders then just return payload as-is
    return TE.right(payload)
  }

  // convert handlers to tasks
  const tasks = builders.reduce(
    (acc, b) => {
      const task = tryCatch(
        () => b.handler(payload, options),
        e =>
          `During the "${stage}" stage, the builder API "${b.name}" was unable to transform the payload. It received the following error message: ${e instanceof Error ? e.message : String(e)}`
        ,
      )
      return [...acc, task]
    },
    [] as PipeTask<S>[],
  )

  return tasks
}

/**
 * The second partial application stage of a CallEventHooks call:
 *
 * - returns a _stage_ which needs to be stated
 * - and then the handlers can take a "payload" of either:
 *    - a synchronous `Pipeline<S>`
 *    - an asynchronous `TaskEither<unknown, Pipeline<S>`
 * - in _both_ cases the return type will be a `TaskEither<string, S>`
 */
export interface HandlerLifecycle {
  <S extends PipelineStage>(stage: S): AsyncPipelineTransformer<S, S>
}
/**
 * A higher order function which starts by taking the `options` for this plugin
 *
 * - returns a function requesting a _stage_,
 * - another function of type `AsyncTransformer` which recieves
 *    - a synchronous `Pipeline<S>`
 *    - an asynchronous `TaskEither<unknown, Pipeline<S>`
 * - in _both_ cases the return type will be a `TaskEither<string, S>`
 */
export type CallEventHooks = (options: ResolvedOptions) => HandlerLifecycle

/**
 * A higher order function which starts by taking the `options` for this plugin
 *
 * - returns a function requesting a _stage_,
 * - another function of type `AsyncTransformer` which recieves
 *    - a synchronous `Pipeline<S>`
 *    - an asynchronous `TaskEither<unknown, Pipeline<S>`
 * - in _both_ cases the return type will be a `TaskEither<string, S>`
 */
export const gatherBuilderEvents = (options: ResolvedOptions) =>
  /**
   * Providing the _stage_ allows isolating only those events
   * which should be executed at this point in time and
   */
  <S extends IPipelineStage>(stage: S) => {
    const task: AsyncPipelineTransformer<S, S> = (payload: PipeTask<S>) => {
      const bt = getBuilderTasks(stage, options)
      return pipe(
        payload,
        TE.match(
          // forward errors
          e => TE.left(e),
          //
          bt,
        ),
      )
    }
    return task
  }

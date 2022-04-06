import * as TE from 'fp-ts/TaskEither'
import { tryCatch } from 'fp-ts/TaskEither'
import type { BuilderConfig, BuilderOptions, BuilderRegistration, IPipelineStage, Pipeline, PipelineStage, ResolvedOptions } from '../types'

/**
 * Provides a composable way to convert the builder's registration into lazy Tasks.
 *
 * Expected usage is to partially apply with a `BuilderRegistration<S>` and get back
 * a `TaskEither<string, Pipeline<S>>` which will then only expect a future _payload_ to be
 * provided for the task to be executed.
 */
export const builderToTask = <
  O extends Record<string, any>,
  S extends PipelineStage,
>(builder: BuilderRegistration<O, S>) =>
  (payload: Pipeline<S>): TE.TaskEither<string, Pipeline<S>> => tryCatch(
    () => builder.handler(payload, builder.options) as Promise<Pipeline<S>>,
    e => `Problems running builder ${builder.name.toUpperCase()}'s handler function: ${e instanceof Error ? e.message : ''}`,
  )

export function isSynchronousPayload<E, S extends IPipelineStage>(payload: TE.TaskEither<E, Pipeline<S>> | Pipeline<S>): payload is Pipeline<S> {
  return !('then' in payload)
}

/** get all builder registrations for a given pipeline stage */
const getBuilders = <S extends IPipelineStage>(stage: S, options: ResolvedOptions) => options.builders.reduce(
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
)[stage] as BuilderRegistration<any, S>[]

const transform = <
  S extends IPipelineStage,
>(builders: BuilderRegistration<any, S>[]) => (p: Pipeline<S>): TE.TaskEither<string, Pipeline<S>> =>
  TE.tryCatch(
    async() => {
      for (const b of builders as BuilderRegistration<any, S>[]) {
        const { name, handler, options } = b
        try {
          p = await handler(p, options)
        }
        catch (e) {
          throw new Error(`Problem mutating builder API ${name}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
      return p
    },
    e => e instanceof Error ? e.message : String(e),
  )

/**
   * Allow any builders which have attached to the given lifecycle hook
   * to participate in the pipeline. Here we are:
   *
   * - converting the async handlers to functional _tasks_ so that they can
   * be better composed in the pipeline
   * - assigning them into the lifecycle hook which they have registered for
   */
export const callEventHooks = (options: ResolvedOptions) => {
  /**
   * Executes all the Builder handler functions for a given
   * `PipelineStage`.
   *
   * Note: will accept both synchronous and async (aka, TaskEither) payload
   * as in input but will always return `TaskEither<E, Pipeline<S>>`
   */
  return <S extends PipelineStage>(stage: S) => {
    const builders = getBuilders(stage, options)

    /** Receives either a sync or async Pipeline<S> value */
    return (payload: TE.TaskEither<unknown, Pipeline<S>> | Pipeline<S>): TE.TaskEither<string, Pipeline<S>> => {
      if (isSynchronousPayload(payload)) {
        return transform(builders)(payload) as TE.TaskEither<string, Pipeline<S>>
      }
      else {
        const mutate = transform(builders)
        const folded = TE.fold(
          e => TE.left(`Problem: ${e}`),
          mutate,
        )
        return folded(payload as TE.TaskEither<unknown, Pipeline<S>>) as TE.TaskEither<string, Pipeline<S>>
      }
    }
  }
}

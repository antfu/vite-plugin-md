import type * as TE from 'fp-ts/lib/TaskEither.js'
import type { IPipelineStage, Pipeline, PipelineStage, RulesUse } from '../types'

export interface BuilderRegistration<O extends BuilderOptions, S extends IPipelineStage> {
  name: Readonly<string>
  description?: Readonly<string>
  /** The lifecycle event/hook which this builder will respond to */
  lifecycle: S
  /**
   * The builder's handler function which receives the _payload_ for the
   * event lifecycle hook configured and then is allowed to mutate these
   * properties and pass back a similarly structured object to continue
   * on in that pipeline stage.
   */
  handler: BuilderHandler<O, S>

  /**
   * The options _specific_ to the builder
   */
  options: O

  /**
   * This isn't strictly required, but it is nice to express which rules you have used
   * modified, or added from the MarkdownIt parser.
   *
   * Note: builders should try to avoid mutating core rules; if they need a modification
   * for their purposes consider _monkey patching_ the rule so that downstream rules
   * have a better understanding of current rule state.
   */
  parserRules?: RulesUse[]

  /**
   * If this plugin needs to modify the configuration in some way at initialization
   * it can add a function here to do that. In most cases, the builder can simply
   * wait for their event hook to be called (at which point they will get the configuration
   * passed to them).
   */
  initializer?: BuilderHandler<O, PipelineStage.initialize>
}

/**
 * a dependency on a stated Builder API by another Builder API
 */
export type BuilderDependency<T extends Partial<{}> = Partial<{}>> = [builder: BuilderApi<BuilderOptions, IPipelineStage>, options: T]

export type OptionsFor<T extends BuilderApi<BuilderOptions, IPipelineStage>> = T extends BuilderApi<infer O, any>
  ? O
  : never

export type BuilderDependencyApi<B extends BuilderApi<BuilderOptions, IPipelineStage>, E extends string = never> = Omit<{
  /**
   * Allows you to state a preferred option configuration for the Builder
   * you are dependant on. This should be seen as a suggestion more than
   * a guarantee because if the end user is _also_ using this configuration,
   * their preferences will always be honored first.
   *
   * Secondarily, if _other_ Builders depend on the same Builder as you then
   * there will be
   */
  withConfig: (options: OptionsFor<B>) => BuilderDependencyApi<B, E | 'withConfig'>
  /**
   * Unlike simple configuration options for a builder dependency, those builders which
   * expose their own "hooks/callbacks" should be seen as a _promise_ by the builder that
   * your passed in function _will_ be run at the appropriate time.
   *
   * **Note:** it is possible that some Builder authors will have callback functionality
   * in their options hash but this is discouraged and unless designed carefully (aka, making
   * sure that the callback is setup as a queue which receives an unknown number of callers))
   * you may find unexpected outcomes where you're callback is overwritten by another
   * dependant Builder.
   */
  usingExposedCallback: (cb: any) => BuilderDependencyApi<B, E>
}, E>

/**
 * The Builder's event listener/handler
 */
export type BuilderHandler<
  O extends BuilderOptions,
  S extends IPipelineStage,
> = (payload: Pipeline<S>, options: O) => Promise<Pipeline<S>>

/**
 * Users configure a `BuilderHandler` and we wrap this up functionality
 * with a higher-order `BuilderTask`.
 *
 * @returns TaskEither<string, Pipeline<S>>
 */
export type BuilderTask<
  S extends IPipelineStage,
> = () => (payload: Pipeline<S>) => TE.TaskEither<string, Pipeline<S>>

export interface BuilderApiMeta {
  /** About the Builder API */
  about: {
    name: Readonly<string>
    description: Readonly<string>
  }
}

export type BuilderOptionsFromUser<O extends {}, S extends IPipelineStage> = (options?: Partial<O>) => () => BuilderRegistration<O, S>

/**
 * Builder options are expected to be a key/value dictionary but must
 * be allowed to be an empty object
 * */
export interface BuilderOptions { [key: string]: any }

export type BuilderConfig = Record<IPipelineStage, BuilderRegistration<BuilderOptions, IPipelineStage>[] | []>

/**
 * Builder's must provide an export which meets this API constraint. Basic
 * structure of this higher order function is:
 *
 * - options( ) -> register( ) -> { handler( payload ) -> payload }
 */
export type BuilderApi<
  O extends BuilderOptions,
  S extends IPipelineStage,
> = BuilderOptionsFromUser<O, S> & BuilderApiMeta

export type InlineBuilder = <N extends string, L extends IPipelineStage>(name: N, lifecycle: L) => (payload: Pipeline<L>) => Pipeline<L>

export interface BuilderReadyForMeta<O extends BuilderOptions, E extends IPipelineStage> {
  /**
   * Step 5:
   * - provide additional details describing this builder
   */
  meta(m?: Omit<BuilderRegistration<O, E>, 'name' | 'lifecycle' | 'handler' | 'options'>): BuilderApi<O, E>
}

export interface BuilderReadyForHandler<O extends BuilderOptions, E extends IPipelineStage> {
  handler(h: BuilderHandler<O, E>): BuilderReadyForMeta<O, E>
}

export interface BuilderReadyForInitializer<O extends BuilderOptions, E extends IPipelineStage> {
  /**
 * Your builder may optionally provide an _initializer_ function who's utility is
 * establishing context and configuration settings at the top of the build pipeline.
 */
  initializer(i?: BuilderHandler<O, PipelineStage.initialize>): BuilderReadyForHandler<O, E>
}

/**
 * The **Builder API** now expects to get a _type_ for the options which
 * the API will accept.
 */
export interface BuilderReadyForOptions<E extends IPipelineStage> {
  options<O extends BuilderOptions = {}>(): BuilderReadyForInitializer<O, E>
}

export interface CreateBuilder {
  <E extends IPipelineStage>(name: string, lifecycle: E): BuilderReadyForOptions<E>
}

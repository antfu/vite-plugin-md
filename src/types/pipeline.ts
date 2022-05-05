import type MarkdownIt from 'markdown-it'
import type { DocumentFragment } from 'happy-dom'
import type * as TE from 'fp-ts/TaskEither'
import type { UserConfig } from 'vite'
import type { Either } from 'fp-ts/lib/Either'
import type { EnumValues, Frontmatter, MetaProperty, ResolvedOptions } from './core'

export enum PipelineStage {
  /**
   * Initialized with incoming filename, config, options,
   * available events (core and provided by builders).
   */
  initialize = 'initialize',

  /**
   * All frontmatter has been extracted from default values and page values
   * but no mapping has been done yet.
   *
   * Note: this is the event hook which the included `meta` builder connects
   * to and it in turn _provides_ a `metaMapped` hook.
   */
  metaExtracted = 'metaExtracted',

  /**
   * The **MarkdownIt** parser is initialized, all builders
   * connecting at this point will receive a valid `md` parser
   * object so that they can participate in MD-to-HTML parsing.
   */
  parser = 'parser',
  /**
   * The **MarkdownIt** parser is initialized and all builders
   * have been able to apply their customizations to it.
   */
  parsed = 'parsed',

  /**
   * The HTML has been converted to a HappyDom tree to allow
   * interested parties to manipulate contents using DOM based
   * queries.
   */
  dom = 'dom',

  /**
   * SFC blocks (template, script, and an array of customBlocks) are ready for
   * builders to inspect/mutate/etc.
   */
  sfcBlocksExtracted = 'sfcBlocksExtracted',

  /**
   * All mutations of page are complete; builders can hook into this stage but
   * will _not_ be able to mutate at this stage.
   */
  closeout = 'closeout',
}

export type IPipelineStage = EnumValues<PipelineStage>

export interface RulesUse {
  ruleName: string
  usage: 'adds' | 'patches' | 'modifies'
  description?: string
}

export type PipelineInitializer = (i?: Pipeline<PipelineStage.initialize>) => Pipeline<PipelineStage.initialize>

export interface BuilderRegistration<O extends BuilderOptions, S extends IPipelineStage> {
  name: string
  description?: string
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

export type Parser<S extends IPipelineStage> = S extends 'parser' | 'parsed' | 'dom' | 'sfcBlocksExtracted' | 'closeout'
  ? {
      /** the **MarkdownIT** parser instance */
      parser: MarkdownIt

    }
  : {}

export type MetaExtracted<S extends IPipelineStage> = S extends 'initialize'
  ? {}
  : {
      /** the frontmatter metadata */
      frontmatter: Frontmatter

      /**
       * The markdown content (after extracting frontmatter)
       */
      md: string

      /**
       * Meta properties that will be put into the HEAD section
       */
      meta: MetaProperty[]

      /**
       * Meta properties which are to be added to the VueJS router's "meta" attribute
       * for this page's route
       */
      routeMeta: Record<string, any>

      /**
       * Non-meta tags that will be put into the HEAD section of the page
       */
      head: Record<string, any>

      excerpt?: string
    }

export type HtmlContent<S extends IPipelineStage> = S extends 'parsed' | 'sfcBlocksExtracted' | 'closeout'
  ? {
      /**
       * the HTML produced from MD content (and using parser rules passed in)
       */
      html: string
    }
  : S extends 'dom'
    ? {
        /**
         * the HTML wrapped into a HappyDom fragment
         */
        html: DocumentFragment

        /**
         * If any code blocks were found on the page then their languages will be represented
         * here as a `Set<string>`
         */
        fencedLanguages: Set<string>
      }
    : {}

export type Blocks<S extends IPipelineStage> = S extends 'sfcBlocksExtracted' | 'closeout'
  ? {
      /**
       * all hoisted scripts
       */
      hoistedScripts: string[]

      /** the SFC's template block (aka, html content) */
      templateBlock: string

      /** the `<script [setup] ...>` block */
      scriptBlock: string

      /** any other top-level SFC blocks besides "template" and "script" */
      customBlocks: string[]
    }
  : {}

export type Completed<S extends IPipelineStage> = S extends 'closeout'
  ? {
      /** the finalized component in string form */
      component: string
    }
  : {}

export type Pipeline<S extends IPipelineStage> = {
  fileName: string
  /** the raw content in the file being processed */
  content: string
  /** the `vite-plugin-md` options */
  options: ResolvedOptions
  /** the Vite config */
  viteConfig: UserConfig

} & Parser<S> & MetaExtracted<S> & HtmlContent<S> & Blocks<S> & Completed<S>

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

/**
 * Builder's must provide an export which meets this API constraint. Basic
 * structure of this higher order function is:
 *
 * - options( ) -> register( ) -> { handler( payload ) -> payload }
 */
export type BuilderApi<O extends {}, S extends IPipelineStage> = (options?: O) => () => BuilderRegistration<O, S>

export type InlineBuilder = <N extends string, L extends IPipelineStage>(name: N, lifecycle: L) => (payload: Pipeline<L>) => Pipeline<L>

/**
 * Builder options are expected to be a key/value dictionary but must
 * be allowed to be an empty object
 * */
export type BuilderOptions = Record<string, any> | {}

export type BuilderConfig = Record<IPipelineStage, BuilderRegistration<any, any>[] | []>

/**
 * Carries an Either<T> condition which is either:
 * - a _string_ error condition
 * - a `Pipeline<S>` value
 */
export type PipeEither<S extends IPipelineStage> = Either<string, Pipeline<S>>

/**
 * Carries an `TaskEither<T>` condition which is either:
 * - a _string_ error condition
 * - a `() => Promise<Pipeline<S>>` task
 */
export type PipeTask<S extends IPipelineStage> = TE.TaskEither<string, Pipeline<S>>

/**
 * A pipeline payload or either an async `PipeTask<S>` or a synchronous `PipeEither<S>`
 */
export type PipelinePayload<S extends IPipelineStage> = PipeTask<S> | PipeEither<S>

/**
 * A _synchronous_ transformer function which:
 *
 * - receives a payload of `PipeEither<F>`, and
 * - converts it to a type of `PipeEither<T>`
 */
export type SyncPipelineTransformer<
  F extends IPipelineStage,
  T extends IPipelineStage,
> = (payload: PipeTask<F>) => PipeTask<T>

/**
* An _asynchronous_ transformer function which:
*
* - receives a payload of `PipeTask<F>` (async) or `PipeEither<F>` (sync)
* - converts it to a type of `PipeTask<T>`
*/
export type AsyncPipelineTransformer<
  F extends IPipelineStage,
  T extends IPipelineStage,
> = (payload: PipeTask<F>) => PipeTask<T>

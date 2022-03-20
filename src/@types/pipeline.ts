import type MarkdownIt from 'markdown-it'
import type { UserConfig } from 'vite'
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
   * The `html` has now had all _script_ blocks extracted from it
   * and the script blocks are isolated in the `hoistedScripts`
   * property
   */
  hoisted = 'hoisted',

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

export interface BuilderRegistration<O extends BuilderOptions, H extends IPipelineStage > {
  name: string
  description?: string
  /** The lifecycle event/hook which this builder will respond to */
  lifecycle: H
  /**
   * The builder's handler function which receives the _payload_ for the
   * event lifecycle hook configured and then is allowed to mutate these
   * properties and pass back a similarly structured object to continue
   * on in that pipeline stage.
   */
  handler: BuilderHandler<O, H>

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

/** container of events organized by PipelineStage */
export type BuilderStruct<T extends string> = Record<PipelineStage | T, any>

export interface AvailablePipelineProps {
  fileName: string
  /** the raw content in the file being processed */
  content: string
  /** the `vite-plugin-md` options */
  options: ResolvedOptions
  /** the Vite config */
  viteConfig: UserConfig

  /** the frontmatter metadata */
  frontmatter: Frontmatter
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
  /**
   * The markdown content (after extracting frontmatter)
   */
  md: string

  /** the **MarkdownIT** parser instance */
  parser: MarkdownIt

  /**
   * the HTML produced from MD content (and using parser rules passed in)
   */
  html: string

  /**
   * If any code blocks were found on the page then their languages will be represented
   * here.
   */
  fencedLanguages: Set<string>

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

  /** the finalized component in string form */
  component: string
}

export type InitializedOmissions = 'md'
| 'fencedLanguages'
| 'frontmatter'
| 'head'
| 'meta'
| 'routeMeta'
| 'excerpt'
| 'html'
| 'hoistedScripts'
| 'templateBlock'
| 'parser'
| 'scriptBlock'
| 'customBlocks'
| 'component'

/** after extracting metadata */
export type MetaOmissions =
| 'fencedLanguages'
| 'parser'
| 'html'
| 'hoistedScripts'
| 'templateBlock'
| 'scriptBlock'
| 'customBlocks'
| 'component'

/** after providing the markdown-it parser */
export type ParserOmissions =
| 'fencedLanguages'
| 'html'
| 'hoistedScripts'
| 'templateBlock'
| 'scriptBlock'
| 'customBlocks'
| 'component'

/** after parsing to raw HTML using markdown-it */
export type ParsedOmissions =
| 'hoistedScripts'
| 'templateBlock'
| 'scriptBlock'
| 'customBlocks'
| 'component'

export type SfcBlockOmissions = 'component'

export type PipelineAvail<S extends IPipelineStage> = S extends 'initialize'
  ? Omit<AvailablePipelineProps, InitializedOmissions>
  : S extends 'metaExtracted' ? Omit<AvailablePipelineProps, MetaOmissions>
    : S extends 'parser' ? Omit<AvailablePipelineProps, ParserOmissions>
      : S extends 'parsed' ? Omit<AvailablePipelineProps, ParsedOmissions>
        : S extends 'sfcBlocksExtracted' ? Omit<AvailablePipelineProps, SfcBlockOmissions>
          : S extends 'closeout' ? AvailablePipelineProps
            : never

/**
 * The _state/payload_ that is available at a given stage in the pipeline process.
 *
 * - `<S>` provides the stage we're in
 * - `<E>` allows a builder to provide additional props for an event they are providing
 */
export type Pipeline<S extends IPipelineStage, E extends {} = {}> =
  PipelineAvail<S> & E

/**
 * The Builder's event listener/handler
 */
export type BuilderHandler<
  O extends BuilderOptions,
  E extends IPipelineStage,
  R extends Pipeline<E> = Pipeline<E>,
> = (payload: Pipeline<E>, options: O) => R

/**
 * Builder's must provide an export which meets this API constraint. Basic
 * structure of this higher order function is:
 *
 * - options() -> register( ) -> listen( ) -> payload
 */
export type BuilderApi<O extends {}, E extends IPipelineStage > = (options?: O) => () => BuilderRegistration<O, E>

export type InlineBuilder = <N extends string, L extends IPipelineStage>(name: N, lifecycle: L) => (payload: Pipeline<L>) => Pipeline<L>

/**
 * Builder options are expected to be a key/value dictionary but must
 * be allowed to be an empty object
 * */
export type BuilderOptions = Record<string, any> | {}

// TODO: BELOW is the type i'd like to use but can't find way to index the enum

// export type BuilderConfig = {
//   [K in keyof UnionToTuple<IPipelineStage>]: BuilderRegistration<any, PipelineStage[K]>[]
// }[keyof UnionToTuple<IPipelineStage>]

export type BuilderConfig = Record<IPipelineStage, BuilderRegistration<any, any>[] | []>

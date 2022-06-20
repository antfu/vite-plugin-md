import type MarkdownIt from 'markdown-it'
import type { MaybeRef } from '@vueuse/core'
import type * as TE from 'fp-ts/TaskEither'
import type { UserConfig } from 'vite'
import type { Either } from 'fp-ts/lib/Either'
import type { Fragment, IElement } from '@yankeeinlondon/happy-wrapper'
import type { EnumValues, Frontmatter, MetaProperty, ResolvedOptions } from './core'
import type { BuilderApi, BuilderDependencyApi } from '~/builders'

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

export type Parser<S extends IPipelineStage> = S extends 'parser' | 'parsed' | 'dom' | 'sfcBlocksExtracted' | 'closeout'
  ? {
      /** the **MarkdownIT** parser instance */
      parser: MarkdownIt

    }
  : {}

/**
 * The **Route** custom-block can be configured with these properties.
 *
 * Note: this is best done with the _meta_ builder
 */
export interface RouteConfig {
  /** The Route's name */
  name?: string
  /** The Route's path */
  path?: string
  /** A dictionary of key/value pairs for the route */
  meta?: Frontmatter
}

export interface LinkProperty {
  rel?: string
  href?: string
  integrity?: string
  crossorigin?: string
  [key: string]: unknown
}

export interface StyleProperty {
  type?: string
  [key: string]: unknown
}

/**
 * The <base> element specifies the base URL and/or target for all
 * relative URLs in a page.
 */
export interface BaseProperty {
  href?: string
  target?: string
}

export interface ScriptProperty {
  /**
   * For classic scripts, if the async attribute is present, then the classic
   * script will be fetched in parallel to parsing and evaluated as soon as it is
   * available.
   *
   * For module scripts, if the async attribute is present then the scripts and
   * all their dependencies will be executed in the defer queue, therefore they will
   * get fetched in parallel to parsing and evaluated as soon as they are available.
   */
  async?: boolean
  crossorigin?: string
  /** only to be used alongside the `src` attribute */
  defer?: boolean
  /** Provides a hint of the relative priority to use when fetching an external script.  */
  fetchPriority?: 'high' | 'low' | 'auto'

  integrity?: string
  /**
   * This Boolean attribute is set to indicate that the script should not be executed
   * in browsers that support ES2015 modules — in effect, this can be used to serve
   * fallback scripts to older browsers that do not support modular JavaScript code.
   */
  nomodule?: boolean
  nonce?: string
  referencePolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  src?: string
  type?: string
  [key: string]: unknown
}

/**
 * The properties destined for the HEAD block in the HTML
 */
export interface HeadProps {
  title?: MaybeRef<string>
  meta?: MaybeRef<MetaProperty[]>
  link?: MaybeRef<LinkProperty[]>
  base?: MaybeRef<BaseProperty[]>
  style?: MaybeRef<StyleProperty[]>
  script?: MaybeRef<ScriptProperty[]>
  htmlAttrs?: MaybeRef<Record<string, unknown>[]>
  bodyAttrs?: MaybeRef<Record<string, unknown>[]>
  [key: string]: unknown
}

/** types available _only_ during initialization */
export type Initialization<S extends IPipelineStage> = S extends 'initialize'
  ? {
      /** allows a Builder API to express a dependency on another Builder API */
      usesBuilder: <T extends BuilderApi<any, any>>(builder: T) => BuilderDependencyApi<T>
    }
  : {}
export interface PipelineUtilityFunctions {
  /**
   * Adds a `<link>` to the page's header section
   */
  addLink: (link: LinkProperty) => void
  /**
   * Adds a `<script>` reference to the page's header section
   */
  addScriptReference: (script: ScriptProperty) => void

  /**
   * Allows the addition of code which will be brought into the
   * `<script setup>` block if using VueJS 3.x and into a normal
   * `<script>` block in VueJS2
   */
  addCodeBlock: (name: string, script: string, forVue2?: string[] | undefined) => void

  /**
   * Adds a `<style>` reference to the page's header section
   */
  addStyleReference: (style: StyleProperty) => void
  /**
   * Adds a VueJS `<script>` block to the HTML (which VueJS will eventually place in HEAD). A style block should be named so that downstream consumers
   * can -- potentially -- override or further modify the style.
   */
  addStyleBlock: (name: string, style: IElement | string) => void
}

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
       *
       */
      // TODO: this should be removed as it's duplicative with what's in `head`
      meta: MetaProperty[]

      excerpt?: string

    } & PipelineUtilityFunctions

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
        html: Fragment

        /**
         * If any code blocks were found on the page then their languages will be represented
         * here as a `Set<string>`
         */
        fencedLanguages: Set<string>
      }
    : {}

export type Blocks<S extends IPipelineStage> = S extends 'sfcBlocksExtracted' | 'closeout'
  ? {

      /** the SFC's template block (aka, html content) */
      templateBlock: string

      /**
       * The `<script setup ...>` block.
       *
       * Since there can only be one block, if the markdown has multiple <script setup>
       * blocks then the interior code will be moved into the single code block to retain
       * the required cardinality.
       */
      scriptSetup: string

      /** the traditional <script> blocks found on the page */
      scriptBlocks: string[]

      /** the style blocks found on the page */
      styleBlocks: string[]

      /** any other top-level SFC blocks besides the traditional */
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
  /** the underlying filename of the source */
  fileName: string
  /** the raw content in the file being processed */
  content: string
  /** the `vite-plugin-md` options */
  options: ResolvedOptions
  /** the Vite config */
  viteConfig: UserConfig

  /**
   * All properties which are destined for the HEAD section of the HTML
   */
  head: HeadProps
  /**
   * Meta properties associated with a page's route; used
   * and managed with the "meta" builder.
   */
  routeMeta?: RouteConfig

  frontmatter?: Frontmatter
  /**
   * Indicates which _languages_ were found on the page; this property typically
   * shouldn't be set but rather is managed by the `code()` builder and provided
   * for contextual decisions.
   */
  codeBlockLanguages: {
    /** the language setting the page author used */
    langsRequested: string[]
    /** the language used to parse with the highlighter */
    langsUsed: string[]
  }

  /**
   * A store for _named_ VueJS `<style>` blocks which will be injected
   * into the SFC component at the appropriate time.
   */
  vueStyleBlocks: Record<string, IElement>

  /**
   * Provides a _named_ set of code blocks which will be injected into
   * the VueJS's SFC's `<script setup>` section for Vue 3 and in a
   * `<script>` block. All blocks will be setup for Typescript.
   *
   * Note: contributors may optionally include additional trailing lines
   * for Vue2; this will allows you to export variables you've defined.
   */
  vueCodeBlocks: Record<string, string | [base: string, vue2Exports: string[]]>
} & Parser<S> & MetaExtracted<S> & HtmlContent<S> & Blocks<S> & Completed<S> & Initialization<S>

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

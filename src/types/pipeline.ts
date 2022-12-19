import type MarkdownIt from 'markdown-it'
import type { MaybeRef } from '@vueuse/core'
import type * as TE from 'fp-ts/lib/TaskEither.js'
import type { UserConfig } from 'vite'
import type { Either } from 'fp-ts/lib/Either.js'
import type { Fragment, IElement } from '@yankeeinlondon/happy-wrapper'
import type { ExistingRawSourceMap } from 'rollup'
import type { AfterFirst, First, Narrowable, Suggest } from 'inferred-types'
import type {
  Frontmatter,
  GenericBuilder,
  MetaProperty,
  ResolvedOptions,
} from './core'

/**
 * **PipelineStage**
 *
 * The _stage_ in the transformation pipeline:
 *
 * - `initialize` - meant for configuration settings
 * - `metaExtracted` - all frontmatter has been separated from the text content
 * giving you a clear but raw markdown content and frontmatter key/value
 * - `parser` - a **markdown-it** parser is initialized; providing the `md` prop
 * on the payload. This is where builders who want to act as a markdown-it-plugin
 * will want to engage.
 * - `parsed` - The **MarkdownIt** parser is initialized and all builders
 * have been able to apply their customizations to it.
 * - `dom` - The HTML has been converted to a HappyDom tree to allow interested builders
 * to manipulate contents using DOM based queries
 * - `sfcBlocksExtracted` - SFC blocks (template, script, and an array of customBlocks)
 * are ready for builders to inspect/mutate/etc.
 * - `closeout` - All mutations of page are complete; builders can hook into this stage
 * but will _not_ be able to mutate at this stage
 */
export type PipelineStage = 'initialize'
| 'metaExtracted'
| 'parser'
| 'parsed'
| 'dom'
| 'sfcBlocksExtracted'
| 'closeout'

export interface RulesUse {
  ruleName: string
  usage: 'adds' | 'patches' | 'modifies'
  description?: string
}

export type Parser<S extends PipelineStage> = S extends 'parser' | 'parsed' | 'dom' | 'sfcBlocksExtracted' | 'closeout'
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
  type?: Suggest<'css' | 'scss'>
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
  /** the charset meta property */
  charset?: MaybeRef<`<meta charset="${string}">` | ''>
  [key: string]: unknown
}

/** types available _only_ during initialization */
export type Initialization<S extends PipelineStage> = S extends 'initialize'
  ? {}
  : {}
export interface PipelineUtilityFunctions {
  /**
   * Set the title attribute in the head of the page
   */
  setTitle(title: string): void

  /**
   * sets the `charset` as a meta tag
   */
  setCharset(type: Suggest<'utf-8'>): void

  /**
   * Adds a `<link>` to the page's header section
   */
  addLink(link: LinkProperty): void

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
   * Adds meta-properties to the HEAD section of the page
   */
  addMetaProperty: (meta: MetaProperty) => void

  /**
   * Sets the meta properties for the pipeline. Be careful as this method is
   * destructive and can cause unintentional loss if you're not careful.
   */
  setMetaProperties(meta: MetaProperty[]): void

  /**
   * Gets the current set of meta properties being processed
   * in the pipeline.
   */
  getMetaProperties(): MetaProperty[]

  /**
   * Receives the name of a possible property and returns that meta property
   * if it exists.
   */
  findMetaProperty(name: string): MetaProperty | undefined

  /**
   * Adds a VueJS `<script>` block to the HTML (which VueJS will eventually place in HEAD). A style block should be named so that downstream consumers
   * can -- potentially -- override or further modify the style.
   */
  addStyleBlock: (name: string, style: IElement | string) => void
}

export type MetaExtracted<S extends PipelineStage> = S extends 'initialize'
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

export type HtmlContent<S extends PipelineStage> = S extends 'parsed' | 'sfcBlocksExtracted' | 'closeout'
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

export type Blocks<S extends PipelineStage> = S extends 'sfcBlocksExtracted' | 'closeout'
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

export type Completed<S extends PipelineStage> = S extends 'closeout'
  ? {
      /** the finalized component in string form */
      component: string
      /** The sourcemap from Markdown to SFC */
      map?: ExistingRawSourceMap | undefined
    }
  : {}

export type Pipeline<
  S extends PipelineStage, B extends readonly any[],
> = {
  stage: S
  /** the underlying filename of the source */
  fileName: string
  /** the raw content in the file being processed */
  content: string
  /** the `vite-plugin-md` options */
  options: ResolvedOptions<B>
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
export type PipeEither<
  S extends PipelineStage,
  B extends readonly GenericBuilder[],
> = Either<string, Pipeline<S, B>>

/**
 * Carries an `TaskEither<T>` condition which is either:
 * - a _string_ error condition
 * - a `() => Promise<Pipeline<S>>` task
 */
export type PipeTask<
  S extends PipelineStage,
  B extends readonly any[],
> = TE.TaskEither<string, Pipeline<S, B>>

/**
 * A pipeline payload or either an async `PipeTask<S>` or a synchronous `PipeEither<S>`
 */
export type PipelinePayload<
  S extends PipelineStage,
  B extends readonly GenericBuilder[],
> = PipeTask<S, B> | PipeEither<S, B>

/**
 * A _synchronous_ transformer function which:
 *
 * - receives a payload of `PipeEither<F>`, and
 * - converts it to a type of `PipeEither<T>`
 */
export type SyncPipelineTransformer<
  F extends PipelineStage,
  T extends PipelineStage,
  B extends readonly GenericBuilder[],
> = (payload: PipeTask<F, B>) => PipeTask<T, B>

/**
* An _asynchronous_ transformer function which:
*
* - receives a payload of `PipeTask<F>` (async) or `PipeEither<F>` (sync)
* - converts it to a type of `PipeTask<T>`
*/
export type AsyncPipelineTransformer<
  F extends PipelineStage,
  T extends PipelineStage,
  B extends readonly GenericBuilder[],
> = (payload: PipeTask<F, B>) => PipeTask<T, B>

export type Contains<T extends Narrowable, A extends readonly any[]> = First<A> extends T
  ? true
  : [] extends AfterFirst<A>
      ? false
      : Contains<T, AfterFirst<A>>
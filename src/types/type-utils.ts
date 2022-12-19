import type { ConfiguredBuilder } from '@yankeeinlondon/builder-api'
import type { AfterFirst, First, Get, Narrowable } from 'inferred-types'
import type { PipelineStage } from './pipeline'

type GetEachAcc<T extends any[] | readonly any[], K, Processed extends readonly any[] = []> = //
  [] extends T
    ? Processed
    : GetEachAcc<AfterFirst<T>, K, [...Processed, Get<First<T>, K>]>

export type GetEach<T extends any[] | readonly any[], K> = GetEachAcc<T, K>

export type BuilderSpecifics<
  T extends readonly ConfiguredBuilder<string, {}, PipelineStage, string>[],
> = Readonly<{
  [K in keyof T]: T[K] extends ConfiguredBuilder<infer Name, infer Options, infer Stage, infer Desc>
    ? ConfiguredBuilder<Name, Options, Stage, Desc>
    : never
}>

export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

export type IfEqual<
  X extends Narrowable,
  Y extends Narrowable, IF extends Narrowable, ELSE extends Narrowable,
> = IsEqual<X, Y> extends true
  ? IF
  : ELSE

type FTuple<
  TTuple extends any[] | readonly any[],
  TFilter,
  Result extends any[] = [],
> = TTuple extends [infer A, ...infer R]
  ? [A] extends [TFilter]
      ? FTuple<R, TFilter, Result>
      : FTuple<R, TFilter, [...Result, A]>
  : Result

/**
 * **FilterTuple**
 *
 * Allows a known tuple `T` to be _filtered down_ by eliminating all items
 * in the Tuple that _extend_ type `F`
 * ```ts
 * type T = [1,"foo",3];
 * // [1,3]
 * type T2 = FilterTuple<T, string>;
 * ```
 */
export type FilterTuple<
  TTuple extends any[] | readonly any[],
  TFilter,
> = TTuple extends any[]
  ? FTuple<TTuple, TFilter>
  : TTuple extends readonly any[]
    ? Readonly<FTuple<[...TTuple], TFilter>>
    : never

/**
 * **FilterNamedConfig**
 *
 * Given a builder "name", this utility will filter out that named
 * configuration if it exists.
 */
export type FilterNamedConfig<
  TName extends string, TBuilders extends readonly any[],
  TResults extends readonly any[] = readonly[],
> = [] extends TBuilders
  ? TResults
  : First<TBuilders> extends ConfiguredBuilder<infer Name, infer Options, infer Stage, infer Desc>
    ? IsEqual<Name, TName> extends true
      ? FilterNamedConfig<TName, AfterFirst<TBuilders>, TResults>
      : FilterNamedConfig<TName, AfterFirst<TBuilders>, readonly [...TResults, ConfiguredBuilder<Name, Options, Stage, Desc>]>
    : FilterNamedConfig<TName, AfterFirst<TBuilders>, TResults>

export type AddBuilder<
  TNew extends Narrowable,
  TBuilders extends readonly any[],
> = TNew extends ConfiguredBuilder<infer Name, infer Options, infer Stage, infer Desc>
  ? readonly [...TBuilders, ConfiguredBuilder<Name, Options, Stage, Desc>]
  : never

export type NamedBuilders<
  TBuilders extends readonly any[],
  TNames extends readonly any[] = readonly[],
> = [] extends TBuilders
  ? TNames
  : First<TBuilders> extends ConfiguredBuilder<infer Name, infer _Options, infer _Stage, infer _Desc>
    ? NamedBuilders<AfterFirst<TBuilders>, readonly [...TNames, Name]>
    : NamedBuilders<AfterFirst<TBuilders>, TNames>
import type { ConfiguredBuilder, PipelineStage } from '@yankeeinlondon/builder-api'
import type { BuilderFrom, ResolvedOptions } from '../types/core'
import type { AddBuilder, FilterNamedConfig } from '../types/type-utils'

export function replaceBuilderOption<
  O extends ResolvedOptions<readonly any[]>,
  TName extends string,
  TOption extends {},
  TStage extends PipelineStage,
  TDesc extends string,
>(options: O, newBuilder: ConfiguredBuilder<TName, TOption, TStage, TDesc>) {
  const names = options.builders.map(b => b.about.name)

  /**
   * the Builder type after removing any homegrown 'meta' builders
   * and adding in the official one
   */
  type Builder = AddBuilder<
    ConfiguredBuilder<TName, TOption, TStage, TDesc>,
    FilterNamedConfig<'meta', BuilderFrom<O>>
  >

  return (
    names.includes(newBuilder.about.name)
      ? {
          ...options,
          builders: options.builders.map(o => o.about.name === newBuilder.name ? newBuilder : o),
        }
      : {
          ...options,
          builders: [...options.builders.filter(i => i?.about?.name !== 'meta'), newBuilder],
        }
  ) as unknown as ResolvedOptions<Builder>
}
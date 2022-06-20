import type { Pipeline, PipelineStage } from '../types'
import type { BuilderApi, BuilderDependency, BuilderDependencyApi, OptionsFor } from '~/builders/builder-types'

export const usesBuilder = (payload: Pipeline<PipelineStage.initialize>, deps: BuilderDependency[]) => <
  T extends BuilderApi<any, any>,
>(builder: T) => {
  const idx = deps.push([builder, {}]) - 1
  const api: <E extends string = never>() => BuilderDependencyApi<T, E> = <E extends string = never>() => ({
    withConfig: (options: OptionsFor<T>) => {
      deps[idx] = [builder, options]
      return api<E | 'withConfig'>()
    },
    usingExposedCallback: (_cb: any) => {
      return api<E>()
    },
  }) as BuilderDependencyApi<T, E>

  return api()
}

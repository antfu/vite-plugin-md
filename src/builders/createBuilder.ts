import type { BuilderApi, BuilderHandler, BuilderOptions, BuilderRegistration, IPipelineStage, Pipeline, PipelineStage } from '../@types'

/**
 * A utility function to help you build a type-safe "builder".
 *
 * Step 1:
 * - provide the **name** and **lifecycle hook** you'll plug into
 * - provide a generic `<O>` which expresses the options this builder will accept
 */
export function createBuilder<E extends IPipelineStage>(name: string, lifecycle: E) {
  return {
    /**
     * A utility function to help you build a type-safe "builder".
     *
     * Step 2:
     * - provide a generic `<O>` which expresses the options this builder will accept
     */
    options: <O extends BuilderOptions>() => {
      return {
        /**
             * A utility function to help you build a type-safe "builder".
             *
             * Step 3:
             * - _if_ your builder needs to initialize state in some way prior
             * to be calling by the event hook, then you should add it here
             * - this is purely optional
             */
        initializer: (initializer?: BuilderHandler<O, PipelineStage.initialize>) => {
          return {
            /**
             * A utility function to help you build a type-safe "builder".
             *
             * Step 4:
             * - provide the **handler function** which is called upon reaching the
             * lifecycle event you've subscribed to
             */
            handler: <R extends Pipeline<E>>(handler: BuilderHandler<O, E, R>) => {
              return {
              /**
               * A utility function to help you build a type-safe "builder".
               *
               * Step 5:
               * - provide additional details describing this builder
               */
                meta: (meta: Omit<BuilderRegistration<any, E>, 'name' | 'lifecycle' | 'handler' | 'options'>) => {
                  const registration: Omit<BuilderRegistration<O, E>, 'options'> = {
                    ...meta,
                    name,
                    lifecycle,
                    handler,
                    initializer,
                  }

                  return (
                    (options: Partial<O> = {}) =>
                      () => ({ ...registration, options }) as BuilderRegistration<O, E>
                  ) as BuilderApi<O, E>
                },
              }
            },
          }
        },
      }
    },
  }
}

import type {
  IPipelineStage,
} from '../types'
import { createFnWithProps } from '../utils'
import type { BuilderApi, BuilderApiMeta, BuilderOptions, BuilderRegistration, CreateBuilder } from './builder-types'

function createAboutSection<N extends string>(name: N, description: string): BuilderApiMeta {
  return {
    about: { name, description },
  } as BuilderApiMeta
}

/**
 * A utility function to help you build a type-safe "builder".
 *
 * Step 1:
 * - provide the **name** and **lifecycle hook** you'll plug into
 * - provide a generic `<O>` which expresses the options this builder will accept
 */
export const createBuilder: CreateBuilder = <E extends IPipelineStage>(name: string, lifecycle: E) => {
  return {
    /**
     * Step 2:
     * - provide a generic `<O>` which expresses the options this builder will accept
     */
    options: <O extends BuilderOptions = {}>() => {
      return {
        /**
             * Step 3:
             * - _if_ your builder needs to initialize state in some way prior
             * to be calling by the event hook, then you should add it here
             * - this is purely optional
             */
        initializer: (initializer) => {
          return {
            /**
             * Step 4:
             * - provide the **handler function** which is called upon reaching the
             * lifecycle event you've subscribed to
             * - your handler should be an async function which will receive the payload
             * along with any options that your builder has configured
             */
            handler: (handler) => {
              return {

                meta: (meta = {}) => {
                  const registration = {
                    ...meta,
                    name,
                    lifecycle,
                    handler,
                    initializer,
                  } as unknown as Omit<BuilderRegistration<O, E>, 'options'>

                  // return a function so that the consumer can add in their options
                  const fn = (options: Partial<O> = {} as Partial<O>) =>
                    () => ({ ...registration, options }) as BuilderRegistration<O, E>

                  const apiMeta = createAboutSection(name, meta.description || '')
                  const api = createFnWithProps(fn, apiMeta)

                  return api as BuilderApi<O, E>
                },
              }
            },
          }
        },
      }
    },
  }
}

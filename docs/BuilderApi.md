# Builder API

> References: [Build Pipeline](./BuildPipeline.md), [Meta Builder](./MetaBuilder.md), [Link Builder](./LinkBuilder.md)

The builder API is a way of extending the functionality of this plugin by being given access to all the power of Vite, Markdown It, and this plugin's hooks. To create a plugin you only need to create a function with the following interface:

```ts
export type BuilderHandler<
  O extends BuilderOptions,
  S extends IPipelineStage,
  R extends Pipeline<E> = Pipeline<E>,
> = (payload: Pipeline<S>, options: O) => R

export interface BuilderRegistration<
  O extends BuilderOptions,
  S extends IPipelineStage,
> {
  name: string
  description?: string
  options: O

  lifecycle: H
  handler: BuilderHandler<O, S>
  initializer?: BuilderHandler<O, PipelineStage.initialize>
}

export type BuilderApi<
  O extends {},
  S extends IPipelineStage,
> = (options?: O) => () => BuilderRegistration<O, S>
```

This is made easier by the `createBuilder()` function which keeps the structure intuitive while ensuring strong type safety of the finished builder.

```ts
import { PipelineStage, createBuilder } from 'vite-plugin-md'

export const builder = createBuilder('myBuilder', PipelineStage.parser)
  .options<MyOptions>()
  .initializer((payload, options) => { /* ... */ })
  .handler((payload, options) => { /* ... */ })
  .meta({
    description: 'better than sliced bread',
  })
```


Notes on `BuilderApi`:

- **Initializer:** all builders will get a chance to mutate the state of the `vite-plugin-md` _options_ before the build pipeline really kicks off
- **Handler:** based on the lifecyle hook chosen, your builder will receive the "payload" that is valid for this stage of the pipeline.
- **Meta:** while not absolutely required, it allows you describe a bit more about what this plugin does, what MarkdownIt rules it interacts with, etc.

For more details, take a look at one of [builders included in this repo](../src/builders) to see how this can be done. 

## Contributing

You should have the infomation you need to build builders now. If you feel that your builder has HIGH reuse potential and you'd like to see it added as a built-in builder please add a PR and make sure you've added tests along with your implementation. If not, then you can use your own builder externally to your heart's content.

Keep on building!
 

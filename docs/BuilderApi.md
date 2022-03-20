# Builder API
> References: [Build Pipeline](./BuildPipeline.md), [Meta Builder](./MetaBuilder.md), [Link Builder](./LinkBuilder.md)

The builder API is a way of extending the functionality of this plugin by being given access to all the power of Vite, Markdown It, and this plugin's hooks. To create a plugin you only need to create a function with the following interface:

```ts
export interface AboutBuilder {
    name?: string
    description?: string
    uses?: MdEvent[]
    produces?: EventDefinition[]
    rules?: RuleUse[]
}

export type BuilderApi<T extends {}> = 
    (options?: T) => (md: MarkdownIt, events: MdEvents, config: ResolvedOptions) => AboutBuilder | void
```

Notes on `BuilderApi`:

- Your _options_ `<T>` must be optional with the aim of setting up sensible defaults for the functionality your adding
- The API doesn't strictly need to return anything but allows for you to describe the scope of the API in a simple way. This will then be exposed to the logger when building.

## Mutating State

When you are building an API there are two primary means of mutating the overall state of the VueJS pages you are producing from Markdown:

1. **Markdown-It Plugins** - this plugin uses a shared instance of `MarkdownIt` and this is made available to a Builder API so it can add/modify rules on the parser as it sees fit. At the point you have the `md` param, you can do exactly the same things you'd do from base configuration's `markdownItSetup()` option. Including adding in and configuring existing plugin(s) as well as your own.
2. **Lifecycle Events** - this plugins provides access to important lifecycle events (defined in `MdEvents`) which you can tap into. These include:

      - `MdEvents["raw"]` - get the raw page content in string form before any transforms have been done
      - `MdEvents["meta"]` - get all meta properties (frontmattter, head, meta, route) passed to you for inspection and possible mutation
      - `MdEvents["template"]` - get the final HTML content before it is published
      - `MdEvents["script"]` - get the final `<script>` block's code before it is published
      - `MdEvents["customBlocks"]` - get an array of any other _blocks_ in the SFC before they are published (an example would be your router config if you're using the "pages" plugin)
    
    Beyond these, however, BuildApi's are allowed to add their own events/hooks. For instance, if you use the included [`link`](LinkBuilder.md) it will expose a `MdEvents["link"]` event which you can hook into. If your plugin _produces_ events than they must be described in the return type's `produces` property so that they can be made available to other plugins.

## Describing Your API

While most plugins can probably get away with returning nothing from their `BuilderApi` implementation it is good be strong in the meta department so please consider adding in some or all of the following. Remember, sharing is caring ;).

- `name` and `description` - using prose you can describe what your Builder API does and what it's called
- `uses` - express which lifecycle events you are _using_ to provide your functionality
- `produces` - if you _produce_ a lifecycle event then you must state it or else it will not be exposed for other Builder API's
- `rules` - allows you to state which **MardownIt** rules you are using and whether or not you have left that rule in a mutated state:
  - In general you should try to avoid _mutating_ a core rule in MarkdownIt as it can create unexpected outcomes downstream. That means, if you are using a rule like `fence`, `link_open`, etc. you should monkey patch the rule and then return it's behavior to the default after you're done.
  - Also, consider leveraging existing Builder API's (and their exposed events) in order to simply your work
  - For instance, the [`link`](./LinkBuilder.md) builder gives you the _link_ event and this means you can opt to receive every link on the page through this event and modify as you see fit. This also helps to ensure _order_ by allowing the Link builder to go first and picking up after it.

The benefits of being expressive in your return type includes:

1. **Conflicts.** If more than one Builder API is using a rule or event hook then when you build you will be notified of this. Note this doesn't indicate a problem but it's likely worth knowing.
2. **Event Extensions.** As already described you _must_ expose any new events that you'd like to have available to others.
3. **Self Describing.** When you have VITE_DEBUG env variable set to anything other than FALSE or the Vite `logLevel` is higher 'warn' or 'error', the build process will report on each each Builder API attributes when the build starts.

## Contributing

You should have the infomation you need to build builders now. If you feel that your builder has HIGH reuse potential and you'd like to see it added as a built-in builder please add a PR and make sure you've added tests along with your implementation. If not, then you can use your own builder externally to your heart's content.

Keep on building!
 

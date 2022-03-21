# vite-plugin-md

Markdown for Vite

- Use Markdown as Vue components
- Use Vue components in Markdown

[![NPM version](https://img.shields.io/npm/v/vite-plugin-md?color=a1b858)](https://www.npmjs.com/package/vite-plugin-md)

> ℹ️ **0.2.x is for Vite 2 and 0.1.x is for Vite 1**

## Install

Install

```bash
npm i vite-plugin-md -D # yarn add vite-plugin-md -D
```

### TypeScript Shim
_where needed:_
```ts
declare module '*.vue' {
  import type { ComponentOptions, ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}

declare module '*.md' {
  const Component: ComponentOptions
  export default Component
}
```

then add the following to `vite.config.js`

```ts
import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/], // <--
    }),
    Markdown(),
  ],
}
```

And import it as a normal Vue component

## Import Markdown as Vue components

```html
<template>
  <HelloWorld />
</template>

<script>
import HelloWorld from './README.md'

export default {
  components: {
    HelloWorld,
  },
}
</script>
```

## Use Vue Components inside Markdown

You can even use Vue components inside your markdown, for example

```html
<Counter :init='5'/>
```

<Counter :init='5'/>

Note you can either register the components globally, or use the `<script setup>` tag to register them locally.

```ts
import { createApp } from 'vue'
import App from './App.vue'
import Counter from './Counter.vue'

const app = createApp(App)

// register global
app.component('Counter', Counter) // <--

app.mount()
```

```html
<script setup>
import { Counter } from './Counter.vue
</script>

<Counter :init='5'/>
```

Or you can use [`vite-plugin-components`](#work-with-vite-plugin-components) for auto components registration.

## Frontmatter

Frontmatter will be parsed and inject into Vue's instance data `frontmatter` field. 

For example:

```md
---
name: My Cool App
---

# Hello World

This is {{frontmatter.name}}
```

Will be rendered as

```html
<h1>Hello World</h1>
<p>This is My Cool App</p>
```

It will also be passed to the wrapper component's props if you have set `wrapperComponent` option.

## Document head and meta

To manage document head and meta, you would need to install [`@vueuse/head`](https://github.com/vueuse/head) and do some setup.

```bash
npm i @vueuse/head
```

then in your `vite.config.js`:

```js
import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      headEnabled: true, // <--
    }),
  ],
}
```

`src/main.js`
```js
import { createApp } from 'vue'
import { createHead } from '@vueuse/head' // <--

const app = createApp(App)

const head = createHead() // <--
app.use(head) // <--
```

Then you can use frontmatter to control the head. For example:

```yaml
---
title: My Cool App
meta:
  - name: description
    content: Hello World
---
```

For more options available, please refer to [`@vueuse/head`'s docs](https://github.com/vueuse/head).

## Configuration / Options

1. **Options Hash**

   The configuration for this plugin is a fully typed dictionary of options and therefore is largely self-documenting.

   See [the tsdoc](./src/types.ts) for more advanced options

2. **Markdown-It** plugins (and options)

   Under the hood this plugin leverages [`markdown-it`](https://github.com/markdown-it/markdown-it) for converting Markdown content to HTML. This parser is very mature and has a rich set of plugins that you use quite easily. If you don't find what you want you can also build your own plugin relatively easily [ [docs](https://markdown-it.github.io/markdown-it/) ].

   Whether you're _using_ or _building_ a plugin, you will incorporate it into this plugin using the `markdownItSetup` property. Alternatively you can also set configuration options of **markdown-it** with `markdownItOptions`:

      ```ts
      // vite.config.js
      import Markdown from 'vite-plugin-md'

      export default {
        plugins: [
          Markdown({
            markdownItOptions: {
              html: true,
              linkify: true,
              typographer: true,
            },
            markdownItSetup(md) {
              // add anchor links to your H[x] tags
              md.use(require('markdown-it-anchor'))
              // add code syntax highlighting with Prism
              md.use(require('markdown-it-prism'))
            },
          }),
        ],
      }
      ```

  3. [`Builder APIs`](./docs/BuilderApi.md)      

      Builder API's are mini-configurators for a particular feature area. The idea behind them is to allow extending functionality quickly with _sensible defaults_ but also providing their own configurations to allow users to grow into and configure that feature area. The builder APIs available are:

        - [Link Builder](./docs/LinkBuilder.md)
        - [Meta Builder](./docs/MetaBuilder.md)

      If you wanted to use both of these builders in their default configuration, you would simply add the following to your options config for this plugin:

      ```ts
      import Markdown, { link, meta } from 'markdown-it-md'
      export default {
        plugins: [
          Markdown({
            builders: [link(), meta()],
          }),
        ],
      }
      ```

      If you're interested in building your own you can refer to the [Builder API](./docs/BuilderApi.md) docs.

## Example

See the [/example](./example).

Or the pre-configured starter template [Vitesse](https://github.com/antfu/vitesse).

## Integrations

This plugin has good integrations with several other plugins, including:

- [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages)
- [`vite-plugin-components`](https://github.com/antfu/vite-plugin-components)
- [`vite-plugin-vue-layouts`](https://github.dev/JohnCampionJr/vite-plugin-vue-layouts)
- for details, refer to the [Integration Page](./docs/Integrations.md)


## License

MIT License © 2020-PRESENT [Anthony Fu](https://github.com/antfu)

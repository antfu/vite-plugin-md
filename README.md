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

Add it to `vite.config.js`

```ts
// vite.config.js
import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/], // <--
    }),
    Markdown()
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

## Document Metadata

This plugin provides strong support for metadata in your markdown content. In general we think of metadata as fitting into the following structure:

```mermaid
flowchart TD
  md((meta data)) --> frontmatter
  md --> head
  md --> router[route meta]

  head --> meta([meta])
  head --> other([other])
```

Now while that seem like a lot of _meta_ for _metadata_ for most most people you can just isolate to the most common of metadata in Markdown content: **frontmatter**.

### Frontmatter

Frontmatter is first class citizen and will be parsed and injected into Vue's instance data `frontmatter` field. 

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

## Page HEAD Properties

The two most common needs for injecting into the HEAD of a markdown page is:

1. Adding meta info for social media sites like Facebook and Twitter to get more visually rich and descriptive links when people share your site
2. Adding the "title" tag to a page

There are of course more but it's kind of fair to group them into HEAD (general like title) and META (which tend to follow noticeable patterns).

If you want to manage either with this plugin you'll need to leverage the [`@vueuse/head`](https://github.com/vueuse/head) package. Many of you will already be familiar it from working in VueJS and once nice benefit of using with your Markdown is that this can provide a bit of consistency between addressing the head of your pages regardless of whether you're using Markdown or VueJS components.

To setup, do the following:

```bash
npm i @vueuse/head
```

```js
// vite.config.js
import Vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      headEnabled: true // <--
    })
  ]
}
```

```js
// src/main.js
import { createApp } from 'vue'
import { createHead } from '@vueuse/head' // <--

const app = createApp(App)

const head = createHead({ title: "My Cool App" }) // <--
app.use(head) // <--
```

Now you can use frontmatter to control the head. For example:

```yaml
---
title: Even Cooler Page
meta:
  - name: description
    content: Hello World
  - name: url
    content: https://cool-site.com
---
```

This does three things:

1. This page -- _being particular cool_ -- will have the title of "Even Cooler Page" and other pages which don't specify will still have the title of "My Cool App" as a default.
2. The meta tags `description` and `url` will be put into the head block and be given a slightly "enhanced" treatment (more in a moment)
3. The `title` -- which we discussed in #1 is _also_ added as a meta tag with the same fancy "enhanced" treatment.

Now before you become concerned that this sounds too _magical_ please understand it is actually very straight forward once you understand the processing steps and the idea of "mapping" that dictates what goes where.

> See [Mapping section](./docs/MetaMapping.md) for more detail.

### Router Meta

When you're using this plugin with the popular pairing of `vite-plugin-pages` this plugin offers a custom SFC block called `<route>` and this allows your VueJS components to add something like:

```html
<script></script>
<template></template>
<route>
  meta:
    layout: exotic
</route>
```

As convenient as this syntax is for a VueJS component, it feels awkward in Markdown where "notational velocity" is almost always the goal. Fortunately we've got you covered. If you're using the default configuration of this plugin you can express that the "exotic" layout property should be set on the route with just a frontmatter property:

```md
---
layout: exotic
---
# Wow this is Amazing!
```

How this works -- exactly like Head and Meta properties -- is done via mapping.

> See [Mapping section](./docs/MetaMapping.md) for more detail.





For more options available, please refer to [`@vueuse/head`'s docs](https://github.com/vueuse/head).

## Options

`vite-plugin-md` uses [`markdown-it`](https://github.com/markdown-it/markdown-it) under the hood, see [`markdown-it`'s docs](https://markdown-it.github.io/markdown-it/) for more details

```ts
// vite.config.js
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Markdown({
      // default options passed to markdown-it
      // see: https://markdown-it.github.io/markdown-it/
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      // A function providing the Markdown It instance gets the ability to apply custom settings/plugins
      markdownItSetup(md) {
        // for example
        md.use(require('markdown-it-anchor'))
        md.use(require('markdown-it-prism'))
      },
      // Class names for the wrapper div
      wrapperClasses: 'markdown-body'
    })
  ],
}
```

See [the tsdoc](./src/types.ts) for more advanced options

## Example

See the [/example](./example).

Or the pre-configured starter template [Vitesse](https://github.com/antfu/vitesse).

## Integrations

### Work with [vite-plugin-voie](https://github.com/vamplate/vite-plugin-voie)

```ts
import Markdown from 'vite-plugin-md'
import Voie from 'vite-plugin-voie'

export default {
  plugins: [
    Voie({
      extensions: ['vue', 'md'],
    }),
    Markdown()
  ],
}
```

Put your markdown under `./src/pages/xx.md`, then you can access the page via route `/xx`.


### Work with [vite-plugin-components](https://github.com/antfu/vite-plugin-components)

`vite-plugin-components` allows you to do on-demand components auto importing without worrying about registration.

```ts
import Markdown from 'vite-plugin-md'
import ViteComponents from 'vite-plugin-components'

export default {
  plugins: [
    Markdown(),
    // should be placed after `Markdown()`
    ViteComponents({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],

      // allow auto import and register components used in markdown
      customLoaderMatcher: path => path.endsWith('.md'),
    })
  ],
}
```

Components under `./src/components` can be directly used in markdown components, and markdown components can also be put under `./src/components` to be auto imported.

## TypeScript Shim

```ts
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}

declare module '*.md' {
  import { ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}
```

## License

MIT License © 2020-PRESENT [Anthony Fu](https://github.com/antfu)

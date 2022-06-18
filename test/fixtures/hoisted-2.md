---
title: Hello
description: "home page to example app"
route:
  - howdy: doody
---

<route lang="yaml">
meta:
  foo: "bar"
</route>

<script setup lang='ts'>
const sayHi = (name: string) => `hi ${name}`
</script>

And now the function we've defined can be used: {{ sayHi('Foo') }}

<script>
const sayBye = (name) => "bye " + name
</script>

And now the function we've defined can be used: {{ sayHi('Foo') }}

<script setup>
const test = ref(1)
</script>

And now the function we've defined can be used: {{ test }}

<script lang="ts">
const test1: string = "test"
</script>

<script lang="js">
const test2 = "test2"
</script>

And now the function we've defined can be used: {{ test1 }}

## Installation

The installation of `vite-plugin-md` is quite simple once you've setup [**ViteJS**](https://vitejs.dev/):

```sh
# use your favorite package manager
npm i -D vite-plugin-md
```

Once installed, you'll add it to your `vite.config.ts` file:

```ts
import Markdown from 'vite-plugin-md'
export default defineConfig(() => ({
  plugins: [
    Markdown()
  ]
}))
```

## Usage

The main _utility_ this plugin provides is the ability to write Markdown files and have them converted into "pages" that sit side-by-side with your other component based pages.

### Frontmatter Metadata

You can add in meta-data to the top of your markdown using the standard convention of Frontmatter which demarcates the beginning/end of the meta data with `---` markers.

The frontmatter for this page is:

```!json
{{ frontmatter }}
```

> **Note:** while it is represented above as a JSON structure; that's mainly because we were showing off how you can reference your own frontmatter props as code blocks. Note, however, that the `requireAuth` property is not set in the page text but rather _configured_ as a default value.

Of course a normal page would use just then standard YAML syntax at the top of the file:

```#md
---
title: "Welcome Earthling"
etc: "..."
---

# Greetings
```

### VueJS Components

Whenever you need more than what Markdown provides, simply drop a VueJS components onto the page and it just works:

<counter></counter>

## Builders

The base functionality of this plugin may be all you need -- or maybe your comfortable with using **markdown it** plugins to extend the base functionality for your needs -- but for those who want to reach into some useful "power ups" you can use a _builder_ to add functionality in powerful ways:

- [Meta](./meta-builder) - manage metadata like a pro
- [Link](./link-builder) - take control over your links
- [Code](./code-builder) - add code highlighting to your pages

## Integrations

This plug is intended to work very well with the following packages:

- [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages)
- [`vite-plugin-components`](https://github.com/antfu/vite-plugin-components)
- [`vite-plugin-vue-layouts`](https://github.dev/JohnCampionJr/vite-plugin-vue-layouts)

For details, refer to the [Integration Page]()

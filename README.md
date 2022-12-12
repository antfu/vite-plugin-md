# vite-plugin-md

Markdown for Vite

- Use Markdown as Vue components
- Use Vue components in Markdown
- Extend functionality with **Builder API**

[![NPM version](https://img.shields.io/npm/v/vite-plugin-md?color=a1b858)](https://www.npmjs.com/package/vite-plugin-md)

> From v0.13, we introduced a pipeline and builder engine ([#54](https://github.com/antfu/vite-plugin-md/pull/54), [#77](https://github.com/antfu/vite-plugin-md/pull/77)) to provide full customizability. If you still prefer the simple Markdown-to-Vue transformation prior to v0.13, it has been moved to [`vite-plugin-vue-markdown`](https://github.com/antfu/vite-plugin-vue-markdown).

## Installing this Plugin

Installation can be done in a few simple steps. From the root of your repo do the following:

1. **NPM Install**

   ```bash
   npm i vite-plugin-md -D # yarn add vite-plugin-md -D
   ```

   > Please note that this plugin _does_ have some peer dependencies; this is by design is intended to provide better control to end users but as NPM has fairly recently changed how they handle peer dependencies these will no longer be automatically be installed for you. You can either add `auto-install-peers=true` to your `.npmrc` file to go back to the old process or install peer deps when told about them.

2. **Vite Configuration**

   Add the following to your `vite.config.js` / `vite.config.ts` file:

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

   > This adds the VueJS along with _this_ repo as "plugins" to Vite. With VueJS you'll also want to make sure to include both `vue` and `md` files.

3. **Typescript Config** (optional)

   If you're using Typescript than you'll want take the additional step of adding a "shim file" to help Typescript to understand how to think of Vue SFC files and Markdown files structurally. For VueJS developers, you've probably already done this for your VueJS files but you can wrap this up with a single file -- `shims.d.ts` -- in the root of your repo:

      ```ts
      declare module '*.vue' {
        import type { ComponentOptions } from 'vue'
        const Component: ComponentOptions
        export default Component
      }

      declare module '*.md' {
        import type { ComponentOptions } from 'vue'
        const Component: ComponentOptions
        export default Component
      }
      ```

4. **Builder Installs** (optional)

    Modern versions of this plugin provide a powerful pipeline system for extending the functionality of this plugin. You can use provided/recommended plugins but you can create these yourself. More on this below but for now be aware that the three _builders_ which had been originally included as internal builders are now "external" to both demonstrate how you can do this and to keep this repo more focused on core pipelining.

    The three "built-in" builders were `code()`, `link()`, and `meta()`. Instead of importing them directly as symbols from this repo you can now just import them directly from their repos:

    - **code** - `pnpm add -D @yankeeinlondon/code-builder`
       > `npm install -D @yankeeinlondon/code-builder`

       > `yarn add -D @yankeeinlondon/code-builder`
    - **meta** - `pnpm add --save-dev @yankeeinlondon/meta-builder`
    - **link** - `pnpm add --save-dev @yankeeinlondon/link-builder`

    At this point the process is exactly the same as before, you simply add these builders into the configuration for this repo like so:

    ```ts
    import Markdown from 'vite-plugin-md'
    import code from '@yankeeinlondon/code-builder'

    export default {
      plugins: [
        Markdown({
          builders: [code()]
        })
      ]
    }
    ```

    >**Note:** `code`, `meta`, and `link` can all be imported from [**md-powerpack**](https://github.com/yankeeinlondon/md-powerpack) -- `npm install -D md-powerpack` -- which is an aggregation repo for builder API's. Either approach is equally valid.

## Using this Plugin

Refer to the _example_ app in this repo for a working example but the really short answer is ... just write markdown files in the same places where you might have written VueJS SFC components and they will both be treated as Vue components in every way.

That means you can:

1. **Import Markdown** as Vue components

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

2. Use **Vue Components** inside your Markdown

   ```markdown
   # My Page
   There I was, there I was ... in the jungle. Then I started hearing this ticking sound and I realized it was some sort of _counter_?

   <Counter :init='5'/>

   I looked a bit closer and realized I could **press** this counter and it would change! What is this magic?
   ```

   In this example we use a custom Vue component called `Counter` (actually found in the demo app) and intermix it with our Markdown content. In this example we leveraged the ability to automatically import components with the powerful Vite plugin [`unplugin-vue-components`](https://github.com/antfu/unplugin-vue-components) but if you prefer not to you can just manually import some components globally or you can also add the following block to your Markdown:

   ```markdown
   <script setup>
   import { Counter } from './Counter.vue'
   </script>
   ```

   In most cases, however, use of the `unplugin-vue-components` just makes life simpler. :)

3. **Frontmatter**

   Frontmatter is a meta-data standard used with most of the static content frameworks and allows you to put name/value pairs at the top of your Markdown files and then use this content within the page. For example:

   ```md
   ---
   name: My Cool App
   ---

   # Hello World

   This is {{name}}
   ```

   Will be rendered as:

   ```html
   <h1>Hello World</h1>
   <p>This is My Cool App</p>
   ```

     **Leveraging Meta Properties**

      It is often useful to have certain "meta properties" associated with your pages and you can do this easily in one of two ways:

      1. If you use `@vueuse/head` then you can enable the `headEnabled` configuration option
      2. If you want to go further you can add the [`meta()`](https://github.com/yankeeinlondon/meta-builder) builder mentioned above

      With both options you can start to add frontmatter like this:

      ```yaml
      meta:
        - name: My Cool App
          description: cool things happen to people who use cool apps
      ```

      This will then intelligently be incorporated into `<meta>` tags in the resulting output. For more information look at the corresponding docs:

      - [Docs for `@vueuse/head`](https://github.com/vueuse/head)
      - [Docs for `@yankeeinlondon/meta-builder`](<https://github.com/yankeeinlondon/meta-builder>)

4. Import Frontmatter from Markdown

    Not only can you import Markdown files as VueJS components (using the _default_ import) but you can also import a Markdown file's frontmatter via a named export:

    ```ts
    import { frontmatter } from 'my-app.md'
    ```

## Configuration / Options

1. **Options Hash**

   The configuration for this plugin is a fully typed dictionary of options and therefore is largely self-documenting.

   See [the ts-doc](./src/types.ts) for more advanced options

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

      Builder API's are mini-configurators for a particular feature area. The idea behind them is to allow extending functionality quickly with _sensible defaults_ but also providing their own configurations to allow users to grow into and configure that feature area. The Builder API and Builder pipeline are the _preferred_ way of extending the functionality of this plugin where possible but due to the vast array of MarkdownIt plugins you may still need to rely on that ecosystem in some cases.

      To empower developers the docs and a `createBuilder` utility can be found here:

      - [Builder API](https://github.com/yankeeinlondon/builder-api)

      and examples of builders can be found here:

     - [Meta Builder](https://github.com/yankeeinlondon/meta-builder)
     - [Link Builder](https://github.com/yankeeinlondon/link-builder)
     - [Code Builder](https://github.com/yankeeinlondon/code-builder)

      If you wanted to use any of these builders in their default configuration, you would simply add the following to your options config for this plugin:

      ```ts
      import Markdown from 'vite-plugin-md'
      // note: all of these plugins are available as part of an aggregation
      // repo for Builder APIs (but you can import directly if you prefer)
      import { code, link, meta } from 'md-powerpack'
      export default {
        plugins: [
          Markdown({
            builders: [link(), meta(), code()],
          }),
        ],
      }
      ```

## Example Usage

See the [/example](./example) app in this repo.

Or the pre-configured starter template [Vitesse](https://github.com/antfu/vitesse).

## Integrations

This plugin has good integrations with several other plugins, including:

- [`vite-plugin-pages`](https://github.com/hannoeru/vite-plugin-pages)
- [`vite-plugin-components`](https://github.com/antfu/vite-plugin-components)
- [`vite-plugin-vue-layouts`](https://github.com/JohnCampionJr/vite-plugin-vue-layouts)
- for details, refer to the [Integration Page](./docs/Integrations.md)

## License

MIT License © 2020-PRESENT [Anthony Fu](https://github.com/antfu) and [Ken Snyder](https://github.com/yankeeinlondon)

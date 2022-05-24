# `code` builder API
> References: [Builder API](./BuilderApi.md), [Build Pipeline](./BuildPipeline.md)

## Overview

Adding _code blocks_ to markdown is one of the more popular features of writing in markdown but to really achieve full effect you'll likely want to pair it with one of the popular code styling plugins which are available. The most popular of these are probably [Prism](https://prismjs.com/) and [HighlightJS](https://highlightjs.org/). Both take a similar approach and in order to keep things simple this builder will use **Prism** and _not_ **HightlightJS** but if you're a fan of HighlightJS you can almost surely take this builder as a model to build this feature into your own builder.

In addition to these two mainstays of code styling, there is another entry which takes a very different approach and that is [Shiki](https://github.com/shikijs/shiki). This builder API will support Shiki styling _or_ Prism. 

> Note: while **Prism** and **HighlightJS** parse code blocks by language and then use apply CSS on a per-node basis to gain highlighting, **Shiki** uses Textmate's "grammer" for tokenizing strings. While Textmate is no longer the popular editor choice it once was, it's standards remained used heavily today and any theme you use in a textmate compatible editor (this includes **vs-code** and **Sublime**) can be used to style your code inline.

### By Example

So by example here is a simple code block using Typescript:

```ts
const foo = 'hello world'
```

by specifying the language choice after the three backticks we get a nicely formatted code block so long as we choose a "supported language". The choice of languages we want to use is configurable and while both renderers provide a ton of _possible_ choices we try to keep the memory footprint compact and only enable the following by default:

 - `html`
 - `markdown`
 - `js` / `ts`
 - `rust`
 - `python`

This is fully configurable and will be discussed in greater detail below.

## Using this Builder

To start using this builder, with all of it's opinionated defaults you simply import the builder and add it to this plugin's configuration like so:

`vite.config.js`:
```ts
import Markdown, { code } from 'vite-plugin-md'

export default defineConfig({
  // ...
  plugins: [
    Markdown({ builders: [code()] }),
  ],
})
```

This should be enough to get some decent defaults in place for your code blocks but in the next section we'll explore how to configure this builder.

## Configuration

The key features which this plugin supports are:

1. **Line Numbers:**

    To help contextualize a code block, we often want _line numbers_ to refer to. By default we keep the UI clean and without this additional meta information so to turn it on by default you can set the `lineNumbers` option to turn it on. This parameter is typically just a boolean flag but alternatively you can pass in a callback function and it will be given the
    _file name_, _language_, and code block _content_ at build time for you decide whether this should have line numbers. Here's an example of how the callback variant might look:
    

    In addition to a global setting, if you want only a specific code block to have line numbers you can add a _modifier_ to the language to achieve this or similar goals:

    - `#` - modifier ensures that regardless of global settings there _will_ be line numbers
    - `!#` - modifier ensures that regardless of global settings there _will not_ be line numbers
    - `!!` - modifier ensures that this code block will behave in the opposite manner to the global setting

    > If you want some good examples of this, take a look at the tests in this repo

2. **Line Highlighting:**

    Sometimes having line number is not enough (or not exactly what is needed) and instead you want to highlight a few lines in a block to stand out from the rest. This too is possible using a syntax borrowed from Vuepress/Vitepress.

3. **Language, Theme, and Engine Selection:**

    As mentioned previously, we conserve the languages and themes which are available "by default" to keep the resulting style sprawl from having negative impact on performance.[^1] This can easily be extended to whatever is supported by the chosen "engine" (aka, Shiki or Prism). This is done via the `engine` and `languages` properties in the configuration:

    You should refer to the 

4. **External Code Referencing:**

    Sometimes you want a code example that you can actual run through tests, ensure it passes lint tests, compiles successfully, etc. Fear not young cadet ... these examples will also be supported with this builder API. This is done using the same syntax provided in both Vuepress and Vitepress. So, for instance if you wanted to show off some cool Rust code you have but keep that file external, you might do the following:

    <code><pre>
    &#96;&#96;&#96;rust
    <<< ~/src/main.rs{6}
    &#96;&#96;&#96;
    </pre></code>

    > Note: you may also use the Vuepress/Vitepress _highlight_ modifier within curly braces (in example above we highlight line 6).


[^1]: traditionally we would worry about both _code_ and _styling_ bloat from additional languages but due to us working within the Vite build pipeline, the JS that is used is all used at build time and should not add any additional JS payload to the runtime
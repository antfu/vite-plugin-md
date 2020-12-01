# vite-plugin-md

Markdown for Vite

## Install

Install

```bash
npm i vite-plugin-md -D # yarn add vite-plugin-md -D
```

Add it to `vite.config.js`

```ts
// vite.config.js
import Markdown from 'vite-plugin-md'

export default {
  plugins: [
    Markdown()
  ],
}
```

And import it as normal a Vue component

```vue
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

## Use Vue Component inside Markdown

You can even use Vue inside your markdown, for example

```html
<Counter :init='5'/>
```

<Counter :init='5'/>

Note you need to register the components globally to use them in Markdown

```ts
import { createApp } from 'vue'
import App from './App.vue'
import Counter from './Counter.vue'

const app = createApp(App)

app.component('Counter', Counter) // <--

app.mount()
```


## Config

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
      }
    })
  ],
}
```

## Example

See the [/example](./example).

## Integrations

### Work with [vite-plugin-voie](https://github.com/vamplate/vite-plugin-voie)

```ts
import Voie from 'vite-plugin-voie'
import Markdown from 'vite-plugin-md'

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

## License

MIT License © 2020 [Anthony Fu](https://github.com/antfu)

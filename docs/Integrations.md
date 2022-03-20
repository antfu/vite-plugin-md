# Integrations

Put your markdown under `./src/pages/xx.md`, then you can access the page via route `/xx`.

## Work with [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

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

> Note: though no longer maintained, [vite-plugin-voie](https://github.com/vamplate/vite-plugin-voie) can also be integrated with this plugin in precisely the same way as discussed above


## Work with [vite-plugin-components](https://github.com/antfu/vite-plugin-components)

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

## Work with [vite-plugin-vue-layouts](https://github.dev/JohnCampionJr/vite-plugin-vue-layouts)

[vite-plugin-vue-layouts](https://github.dev/JohnCampionJr/vite-plugin-vue-layouts) plugin provides a nice complement to the [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) by providing a wrapper component (aka, a "layout") around components -- which includes Markdown files -- when integrated with _pages_. 

To use this integration with this plugin, nothing is really needed from a configuration standpoint ... it should generally just work ... but this plugin does provide "route meta" configuration that may be of interest (see [meta builder](./MetaBuilder.md) for more info).
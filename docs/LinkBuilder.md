# Link Builder for `vite-plugin-md`

The `link` _builder_ is an available import from this plugin and provides a good set of defaults for your Markdown's content as well as a simple configuration should you want to go further or do things differently.

In all cases, this configurator is meant to be plugged into the `linkTransforms` option on this plugin. So the default usage pattern would look like:

```ts
// vite.config.js
import Markdown, { link } from 'vite-plugin-md'

export default defineConfig({
    // ...
    plugins: [
        Markdown({ linkTransforms: link() }),
    ],
})
```

## Default Behavior

With no configuration passed into `link()` you will get the following behavior:

- **Class Attribution**
  - internal vs. external links
  - any reference to a `http` (versus `https:`) resource will be given the class "insecure"
  - if a non-HTTP protocol is specified (e.g., `mailto:`, `file:`, etc.)
  - if a document has an `href` directly to an image, document, code the _content type_ will be be given a class
  - anchor links (aka, links to the same page) will also get a class
- **VueJS Router**
  - any internal link will be converted from `<a href="xyz">` link to a `<router-link to="xyz" >` and the relative paths needed to produce a valid route will be calculated for you
- **Link Cleanup**
  - in **vs-code** (and various other editors), linking between two Markdown files is supported with autocomplete but the completed link maps directly to the markdown FILE (aka, has `.md` extension)
  - this is _desireable_ for file based linking but needs to be tidied up when converting to HTTP based navigation
  - The default configuration will:
    - remove `index.md` fully just leaving the "directory" or "route"
    - remove `.md` from all other links

## Configuration

The configuration is all done with a single dictionary configuration object passed into `link( config )` and is fully typed. Rather than documenting this twice, just refer to the typed documentation in the config object.
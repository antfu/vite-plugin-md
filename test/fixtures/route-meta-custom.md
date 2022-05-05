---
title: Metadata for your Route
layout: yowza
requiresAuth: true
image: facebook.png
---

# {{title}}

By default the property `layout` is assumed to be a route metadata property (if defined) but otherwise you must configure other properties. This is easily done, however:

```ts
Markdown({
  builders: [meta({ routeProps: ['layout', 'requiresAuth'] })]
})
```

With this test file we hope to test whether the default prop "layout" _and_ the configured property "requiresAuth" are moved into the route meta by use of a custom block in the SFC.

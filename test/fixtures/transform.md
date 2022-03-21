---
title: transform tests
description: hello world
hello: how friendly
---

# Hello

<style>h1 { color: red }</style>
<script setup lang="ts">
import Foo from './Foo.vue'
</script>

- A
- B
- C

## Escaping Code Tag Interpolation

<div>{{hello}}</div>

When the markdown below is parsed -- assuming the default behavior of "escapeCodeTagInterpolation" is set -- it should be translated to include a "pre" attribute on the `code` tag so that VueJS does not interpolate this as a variable:

```html
<div>{{hello}}</div>
```

By contrast, the below code fence will take on the opposite behavior:

```!ts
const theValue = {{ hello }};
```


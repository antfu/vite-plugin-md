---
title: External Referencing using VPress notation
---
# External Referencing

The ability to reference code blocks where the code exists externally to the markdown file.

```ts { "heading": "External Code", "highlight": 2 } <<< ./foo/code.ts
//
```

> Note: a single empty comment line is useful because many editors or language servers will
> want there to be at least a single line. For this reason, this line should be allowed but
> ignored in the output.

This format above is meant to keep -- in part -- with Vuepress/Vitepress syntax but the angle brackets tend to throw off editor's parsing so below you'll see that we can also use `filename` in the standard object syntax to load the file:

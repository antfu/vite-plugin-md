# External Referencing
The ability to reference code blocks where the code exists externally to the markdown file.

```ts { "heading": "External Code", "highlight": 2, "filename": "./foo/code.ts" }
//
```

This format above is meant to keep -- in part -- with Vuepress/Vitepress syntax but the angle brackets tend to throw off editor's parsing so below you'll see that we can also use `filename` in the standard object syntax to load the file:

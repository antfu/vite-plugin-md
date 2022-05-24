---
title: Code block with Indentation
---

# Code Builder Test

this test is intended to validate testing of code blocks

```ts
export default defineConfig(() => {
  plugins: [
    Markdown({
      builders: [code(), link(), meta()]
    })
  ]
})
```

The test is now complete; everyone should return to their desks.

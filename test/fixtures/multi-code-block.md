---
title: Multi Code Block
---

# {{ title }}

This test is intended to validate testing of code blocks; the first test is a typescript block.

```ts { "class": "foobar" }
type Valid = 'foo' | 'bar' | 'baz'
const t: Valid = 'foo'
```

But now we have some Rust code too:

```!#rust class: "foobar", style: "classless"
let count: usize = 100;
```

The test is now complete; everyone should return to their desks.

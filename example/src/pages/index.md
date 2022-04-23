---
title: Hello
meta:
  - name: description
    content: Hello World
test: test
---



# Hello world!

Front matter: 
```!json
{{ frontmatter }}
```

```json
{
  "foo": "bar"
}
```

<style>
h1 {
  color: cadetblue;
}
</style>


<Counter />
<br>
<Counter />

<router-link to="/">Home</router-link>

<route>
{
  meta: {
    layout: 'home'
  }
}
</route>

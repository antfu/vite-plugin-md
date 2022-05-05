---
title: Hello
meta:
  - name: description
    content: Hello World
test: test
---

<route lang="yaml">
meta:
  foo: "bar"
</route>

## Installation

fill in

## Usage

fill in

### Frontmatter Metadata

You can add in meta-data to the top of your markdown using the standard convention of Frontmatter which demarcates the beginning/end of the meta data with `---` markers.

The frontmatter for this page is:

```!#json heading="frontmatter"
{{ frontmatter }}
```

> Note: while it is represented here as a JSON structure, in the markdown you would add in YAML syntax.

## VueJS Components

You can embed VueJS components into your markdown whereever you like:

<Counter />

<router-link to="/">Home</router-link>

<route>
{
  meta: {
    layout: 'home'
  }
}
</route>

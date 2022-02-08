import { describe, expect, it } from 'vitest'
import { createMarkdown } from '../src/markdown'
import { resolveOptions } from '../src/options'

describe('excerpt', () => {
  const options = resolveOptions({
    excerpt: true,
    grayMatterOptions: {
      excerpt: true,
      excerpt_separator: '<!-- more -->',
    },
  })
  const markdownToVue = createMarkdown(options)

  it('basic-excerpt', () => {
    const md = `---
title: Hey
---

This is an excerpt.

<!-- more -->

# Hello

- A
- B
- C`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })
})

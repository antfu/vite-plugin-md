import { createMarkdown } from '../src/markdown'
import { resolveOptions } from '../src/options'

describe('transform', () => {
  const options = resolveOptions({})
  const markdownToVue = createMarkdown(options)

  it('basic', () => {
    const md = `---
title: Hey
---

# Hello

- A
- B
- C
`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })

  it('style', () => {
    const md = `
# Hello

<style>h1 { color: red }</style>
`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })

  it('script setup', () => {
    const md = `
# Hello

<script setup lang="ts">
import Foo from './Foo.vue'
</script>
`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })

  it('exposes frontmatter', () => {
    const md = `---
title: Hey
---

# Hello`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })

  it('couldn\'t expose frontmatter', () => {
    const md = `---
title: Hey
---

<script setup>
defineExpose({ test: 'test'})
</script>
`
    expect(markdownToVue('', md)).toMatchSnapshot()
  })
})

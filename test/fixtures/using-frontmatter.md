---
image: '/images/foobar.jpg'
title: 'Frontmatter in Action'
---

<script>
import { frontmatter: simple } from './simple.md'
</script>

# {{title}}

A nice image to brighten your day:

![test image]({{image}})

Simple: {{ simple.description }}

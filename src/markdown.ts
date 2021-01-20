import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import { ResolvedOptions } from './types'
import { toArray } from './utils'

export function createMarkdown(options: ResolvedOptions) {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    ...options.markdownItOptions,
  })

  options.markdownItUses.forEach((e) => {
    const [plugin, options] = toArray(e)

    markdown.use(plugin, options)
  })

  options.markdownItSetup(markdown)

  return (id: string, raw: string) => {
    const { wrapperClasses, wrapperComponent, transforms, headEnabled, headField } = options

    if (transforms.before)
      raw = transforms.before(raw, id)

    const { content: md, data: frontmatter } = matter(raw)
    let html = markdown.render(md, {})

    if (wrapperClasses)
      html = `<div class="${wrapperClasses}">${html}</div>`
    if (wrapperComponent)
      html = `<${wrapperComponent} :frontmatter="frontmatter">${html}</${wrapperComponent}>`

    if (transforms.after)
      html = transforms.after(html, id)

    const scriptLines: string[] = []

    scriptLines.push(`const frontmatter = ${JSON.stringify(frontmatter)}`)
    if (headEnabled) {
      scriptLines.unshift('import { useHead } from "@vueuse/head"')
      const headGetter = headField === '' ? 'frontmatter' : `frontmatter["${headField}"]`
      scriptLines.push(`useHead(${headGetter})`)
    }

    const sfc = `<template>${html}</template>\n<script setup>${scriptLines.join('\n')}</script>`

    return sfc
  }
}

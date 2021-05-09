import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import { ResolvedOptions } from './types'
import { toArray } from './utils'

const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*>([\s\S]*)<\/script>/mg

function extractScriptSetup(html: string) {
  const scripts: string[] = []
  html = html.replace(scriptSetupRE, (_, script) => {
    scripts.push(script)
    return ''
  })

  return { html, scripts }
}

function extractCustomBlock(html: string, options: ResolvedOptions) {
  const blocks: string[] = []
  for (const tag of options.customSfcBlocks) {
    html = html.replace(new RegExp(`<${tag}[^>]*\\b[^>]*>[^<>]*<\\/${tag}>`, 'mg'), (code) => {
      blocks.push(code)
      return ''
    })
  }

  return { html, blocks }
}

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
    const { wrapperClasses, wrapperComponent, transforms, headEnabled, frontmatterPreprocess } = options

    if (transforms.before)
      raw = transforms.before(raw, id)

    const { content: md, data } = options.frontmatter
      ? matter(raw)
      : { content: raw, data: null }

    let html = markdown.render(md, {})

    if (wrapperClasses)
      html = `<div class="${wrapperClasses}">${html}</div>`
    else
      html = `<div>${html}</div>`
    if (wrapperComponent)
      html = `<${wrapperComponent}${options.frontmatter ? ' :frontmatter="frontmatter"' : ''}>${html}</${wrapperComponent}>`
    if (transforms.after)
      html = transforms.after(html, id)

    const hoistScripts = extractScriptSetup(html)
    html = hoistScripts.html
    const customBlocks = extractCustomBlock(html, options)
    html = customBlocks.html

    const scriptLines: string[] = []

    if (options.frontmatter) {
      const { head, frontmatter } = frontmatterPreprocess(data || {}, options)
      scriptLines.push(`const frontmatter = ${JSON.stringify(frontmatter)}`)
      if (headEnabled && head) {
        scriptLines.push(`const head = ${JSON.stringify(head)}`)
        scriptLines.unshift('import { useHead } from "@vueuse/head"')
        scriptLines.push('useHead(head)')
      }
    }

    scriptLines.push(...hoistScripts.scripts)

    const sfc = `<template>${html}</template>\n<script setup>\n${scriptLines.join('\n')}\n</script>\n${customBlocks.blocks.join('\n')}\n`

    return sfc
  }
}

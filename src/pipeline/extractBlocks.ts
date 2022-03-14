import type { ResolvedOptions } from '../types'
import { isVue2, wrap } from '../utils'
import type { Metadata } from './extractMeta'

const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*>([\s\S]*)<\/script>/mg
const defineExposeRE = /defineExpose\s*\(/mg

/**
 * Finds any references to `<script>` blocks and extracts it
 * from the html portion.
 */
function extractScriptBlocks(html: string) {
  const scripts: string[] = []
  html = html.replace(scriptSetupRE, (_, script) => {
    scripts.push(script)
    return ''
  })

  return { html, scripts }
}

/**
 * Removes unwanted SFC blocks from the HTML while keeping track of
 * the other custom blocks.
 */
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

export interface HtmlScriptAndBlocks {
  /**
   * The HTML -- with both hoisted scripts and custom blocks extracted -- resulting from
   * the passed in Markdown content.
   */
  html: string
  /**
   * The `<script`> block
   */
  script: string
  /**
   * Any SFC blocks which remain after filtering out those in the `customSfcBlocks` options
   * parameter.
   */
  customBlocks: string[]
}

/**
 * Converts the markdown content to an HTML template and extracts both
 * the HTML and scripts.
 */
export function extractBlocks(meta: Metadata, options: ResolvedOptions): HtmlScriptAndBlocks {
  let { html } = meta
  const { wrapperClasses, wrapperComponent, escapeCodeTagInterpolation } = options

  if (wrapperClasses)
    html = `<div class="${wrapperClasses}">${html}</div>`
  else
    html = `<div>${html}</div>`
  if (wrapperComponent)
    html = `<${wrapperComponent}${options.frontmatter ? ' :frontmatter="frontmatter"' : ''}${options.excerpt ? ' :excerpt="excerpt"' : ''}>${html}</${wrapperComponent}>`

  if (escapeCodeTagInterpolation) {
    // escape curly brackets interpolation in <code>, #14
    html = html.replace(/<code(.*?)>/g, '<code$1 v-pre>')
  }

  // extract script blocks, adjust HTML
  const hoistScripts = extractScriptBlocks(html)
  html = hoistScripts.html
  const scriptLines: string[] = hoistScripts.scripts

  // extract custom blocks, adjust HTML
  const customBlocks = extractCustomBlock(html, options)
  html = customBlocks.html

  // when frontmatter is allowed, add script lines and adjust
  // HEAD, META, and ROUTER meta
  if (options.frontmatter) {
    // add all frontmatter as "frontmatter" prop
    scriptLines.push(`const frontmatter = ${JSON.stringify(meta.frontmatter)}`)

    // add each frontmatter prop as a root property
    // TODO: I'm not clear why we're doing both; seems repetitive and I'd prefer the
    // frontmatter properties to just be accessible as root properties
    Object.entries(meta.frontmatter)
      .forEach(([key, value]) => scriptLines.push(`${isVue2(options) ? 'export' : ''} const ${key} = ${JSON.stringify(value)}`))

    if (!isVue2(options) && options.exposeFrontmatter && !defineExposeRE.test(hoistScripts.scripts.join('')))
      scriptLines.push('defineExpose({ frontmatter })')
    else if (isVue2(options) && options.exposeFrontmatter)
      scriptLines.push('export default { data() { return { frontmatter } } }\n')

    const head = options.headEnabled && !isVue2(options)
      ? meta.metaProps.length > 0
        ? { ...meta.head, meta: meta.metaProps }
        : { ...meta.head, meta: [] }
      : null

    if (head) scriptLines.push(`const head = ${JSON.stringify(head)}`)

    if (Object.keys(meta.routeMeta || {}).length > 0)
      customBlocks.blocks.push(`<route>{ meta: { ${JSON.stringify(meta.routeMeta)} } }</route>`)
  }

  const script = isVue2(options)
    ? wrap('script', scriptLines.join('\n'))
    : wrap('script setup', scriptLines.join('\n'))

  return { html, script, customBlocks: customBlocks.blocks }
}

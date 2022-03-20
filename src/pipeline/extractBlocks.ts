import type {
  Pipeline,
  PipelineStage,
  ResolvedOptions,
} from '../@types'
import { isVue2, wrap } from '../utils'

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
 * Separates SFC blocks from within the HTML into separate variables
 */
function extractCustomBlock(html: string, options: ResolvedOptions) {
  const customBlocks: string[] = []
  let templateBlock = html
  for (const tag of options.customSfcBlocks) {
    templateBlock = templateBlock.replace(new RegExp(`<${tag}[^>]*\\b[^>]*>[^<>]*<\\/${tag}>`, 'mg'), (code) => {
      customBlocks.push(code)
      return ''
    })
  }

  return { templateBlock, customBlocks }
}

/**
 * Converts the markdown content to an HTML template and extracts both
 * the HTML and scripts.
 */
export function extractBlocks(payload: Pipeline<PipelineStage.parsed>): Pipeline<PipelineStage.sfcBlocksExtracted> {
  // eslint-disable-next-line prefer-const
  let { html, options, frontmatter, head, routeMeta } = payload
  // extract script blocks, adjust HTML
  const hoistScripts = extractScriptBlocks(html)
  html = hoistScripts.html
  const hoistedScripts: string[] = hoistScripts.scripts

  const { templateBlock, customBlocks } = extractCustomBlock(html, options)

  // when frontmatter is allowed, add script lines and adjust
  // HEAD, META, and ROUTER meta
  if (options.frontmatter) {
    // add all frontmatter as "frontmatter" prop
    hoistedScripts.push(`const frontmatter = ${JSON.stringify(frontmatter)}`)

    Object.entries(frontmatter)
      .forEach(([key, value]) => hoistedScripts.push(`${isVue2(options) ? 'export' : ''} const ${key} = ${JSON.stringify(value)}`))

    if (!isVue2(options) && options.exposeFrontmatter && !defineExposeRE.test(hoistScripts.scripts.join('')))
      hoistedScripts.push('defineExpose({ frontmatter })')
    else if (isVue2(options) && options.exposeFrontmatter)
      hoistedScripts.push('export default { data() { return { frontmatter } } }\n')

    if (head) hoistedScripts.push(`const head = ${JSON.stringify(head)}`)

    if (Object.keys(routeMeta || {}).length > 0)
      customBlocks.push(`<route>{ meta: { ${JSON.stringify(routeMeta)} } }</route>`)
  }

  const scriptBlock = isVue2(options)
    ? wrap('script', hoistedScripts.join('\n'))
    : wrap('script setup', hoistedScripts.join('\n'))

  return { ...payload, hoistedScripts, templateBlock, scriptBlock, customBlocks }
}

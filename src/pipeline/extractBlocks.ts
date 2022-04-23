import type {
  ResolvedOptions,
} from '../types'
import { isVue2, transformer, wrap } from '../utils'

const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*>([\s\S]*)<\/script>/mg

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
export const extractBlocks = transformer('extractBlocks', 'parsed', 'sfcBlocksExtracted', (payload) => {
  // eslint-disable-next-line prefer-const
  let { html, options, frontmatter, head, routeMeta } = payload
  // extract script blocks, adjust HTML
  const hoistScripts = extractScriptBlocks(html)
  html = hoistScripts.html
  const hoistedScripts: string[] = hoistScripts.scripts

  const { templateBlock, customBlocks } = extractCustomBlock(html, options)
  const blocks = {
    /** adds the lines needed to include useHead() */
    useHead: head && options.headEnabled
      ? `import { useHead } from "@vueuse/head"\n  const head = ${JSON.stringify(head)}\n  useHead(head)`
      : '',
    importDefineExpose: options.frontmatter ? 'import { defineExpose } from \'vue\'' : '',
    exposeFrontmatter: options.frontmatter && options.exposeFrontmatter
      ? `defineExpose({ frontmatter: ${JSON.stringify(frontmatter)} })`
      : '',
    /** variable declaration which must be placed in a manner that external actors can reach it */
    frontmatter: options.frontmatter && options.exposeFrontmatter
      ? `/** frontmatter meta-data for MD page **/\n  export const frontmatter = ${JSON.stringify(frontmatter)}`
      : '',
    /** returning the 'frontmatter' property for external actors using Vue3 */
    vue3CompositionReturn: options.frontmatter ? 'return { frontmatter }' : '',
    /** return 'frontmatter' on the data property for Vue2 users */
    vue2DataExport: 'export default { data() { return { frontmatter } } }',
    /** variables usable in page template */
    localVariables: Object.entries(frontmatter).reduce(
      (acc, [key, value]) => `${acc}\n${isVue2(options) ? 'export' : ''} const ${key} = ${JSON.stringify(value)}`,
      '',
    ),
    /**
     * Adds a route section (aka, custom block) in the component if needed
     */
    routeMeta: Object.keys(routeMeta || {}).length > 0
      ? `<route>{ meta: { ${JSON.stringify(routeMeta)} } }</route>\n`
      : '',
  }

  const scriptBlock = isVue2(options)
    ? wrap('script', [blocks.localVariables, blocks.frontmatter, blocks.vue2DataExport].join('\n'))
    : `${wrap('script setup', [
      blocks.useHead,
      blocks.exposeFrontmatter,
      blocks.localVariables,
    ].filter(i => i).join('\n  '))}
    ${wrap('script', [
    blocks.frontmatter,
  ].filter(i => i).join('\n  '))}
    ${blocks.routeMeta}`

  return { ...payload, hoistedScripts, templateBlock, scriptBlock, customBlocks }
})

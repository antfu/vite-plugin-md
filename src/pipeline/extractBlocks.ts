import { extract, select, toHtml } from 'happy-wrapper'
import type { HTML, IElement } from 'happy-wrapper'
import { isVue2, transformer, wrap } from '../utils'
import type {
  Pipeline,
  PipelineStage,
  ResolvedOptions,
} from '../types'

const elementHashToArray = (hash?: Record<string, IElement>): IElement[] => hash
  ? Object.keys(hash).reduce(
    (acc, k) => {
      acc.push(hash[k])
      return acc
    },
    [] as IElement[],
  )
  : []

const codeBlocksToArray = (hash?: Record<string, string | [string, string[]]>): string[] => hash
  ? Object.keys(hash).reduce(
    (acc, k) => {
      const val = hash[k]
      acc.push(Array.isArray(val) ? val[0] : val)
      return acc
    },
    [] as string[],
  )
  : []

const createVue2ScriptBlock = (codeBlocks: Record<string, string | [base: string, vue2Exports: string[]]>) => {
  const accumulatedExports: string[] = Object.keys(codeBlocks)
    .flatMap(k => Array.isArray(codeBlocks[k]) ? codeBlocks[k][1] : [])
    .filter(i => i)
  const codeLines = Object.keys(codeBlocks).map(key => Array.isArray(codeBlocks[key])
    ? codeBlocks[key][0]
    : codeBlocks[key],
  )

  return `<script lang='ts'>\n${codeLines.join('\n')}\nexport { ${accumulatedExports.join(', ')} }\n`
}

/**
 * Finds any references to `<script>` blocks and extracts it
 * from the html portion. This is then added to scriptBlocks
 * which been accumulated by calls to `addStyleBlock()`
 */
function extractScriptBlocks(html: HTML, p: Pipeline<PipelineStage.dom>) {
  const scripts: IElement[] = []
  const extractor = extract(scripts)
  html = select(html)
    .updateAll('script')(extractor)
    .append(elementHashToArray(p.vueStyleBlocks))
    .toContainer()

  return { html, scripts: scripts.map(el => toHtml(el)) }
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
 * Separates the various "blocks" in an SFC component. This includes the
 * template and script section(s) but can also include custom blocks (which
 * typically is the Router metadata being moved into the route's meta prop)
 */
export const extractBlocks = transformer('extractBlocks', 'dom', 'sfcBlocksExtracted', (payload) => {
  // eslint-disable-next-line prefer-const
  let { options, frontmatter, head, routeMeta } = payload

  /** HTML converted back to a string */
  let html = toHtml(payload.html)
  // extract script blocks, adjust HTML
  const hoistScripts = extractScriptBlocks(html, payload)
  html = hoistScripts.html
  const hoistedScripts: string[] = hoistScripts.scripts

  const { templateBlock, customBlocks } = extractCustomBlock(html, options)
  const templateBlocks = {
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

  }

  const regularScriptBlocks = hoistScripts.scripts.map(
    s => select(s).filterAll('script[setup]').toContainer(),
  ).filter(i => i).join('\n')
  /** all `<setup script>` blocks */
  const scriptSetupBlocks = hoistScripts.scripts
    .map(
      s => select(s)
      // unwrap the <script>...</script> tag and return only interior content
        .mapAll('script[setup]')(el => el.innerHTML),
    )
    .join('\n')
  /** userland `<setup script>` import directives */
  const importDirectives: string[] = []

  /** all userland non-import lines in `<setup script>` blocks */
  const nonImportDirectives = scriptSetupBlocks.split('\n').map((line) => {
    if (/^import/.test(line)) {
      importDirectives.push(line)
      return ''
    }
    else { return line }
  }).filter(i => i).join('\n')

  const scriptBlock = isVue2(options)
    ? [
        wrap('script', [
          templateBlocks.localVariables,
          templateBlocks.frontmatter,
          templateBlocks.vue2DataExport,
        ].join('\n')),
        [
          ...hoistScripts.scripts,
          createVue2ScriptBlock(payload.vueCodeBlocks),
        ].join('\n'),
      ].filter(i => i).join('\n')
    // Vue3
    : [
        wrap('script setup', [
          ...importDirectives,
          templateBlocks.useHead,
          templateBlocks.exposeFrontmatter,
          templateBlocks.localVariables,
          nonImportDirectives,
          ...codeBlocksToArray(payload.vueCodeBlocks),
        ].filter(i => i).join('\n  ')),
        wrap('script', templateBlocks.frontmatter),
        regularScriptBlocks,
      ].filter(i => i).join('\n')

  if (routeMeta)
    customBlocks.push(`<route lang="json">${JSON.stringify(routeMeta)}</route>\n`)

  return {
    ...payload,
    html,
    hoistedScripts,
    templateBlock,
    scriptBlock,
    customBlocks,
  }
})

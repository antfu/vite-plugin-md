import { extract, getAttribute, select, toHtml } from '@yankeeinlondon/happy-wrapper'
import type { IElement } from '@yankeeinlondon/happy-wrapper'
import { pipe } from 'fp-ts/lib/function.js'
import { isVue2, transformer, wrap } from '../utils'
import type {
  GenericBuilder,
  Pipeline,
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
 * Finds any references to `<script>` and `<script setup>` blocks and extracts it
 * from the html. The pipeline's HTML is updated and the two varieties of scripts
 * are returned.
 */
function extractScriptBlocks<
  P extends Pipeline<'dom', any>,
>(p: P) {
  const scripts: IElement[] = []
  const extractor = extract(scripts)
  const html = select(p.html)
    .updateAll('script')(extractor)
    .toContainer()

  p.html = html

  const lang = getAttribute('lang')
  const scriptSetups = select(scripts.join('\n')).findAll('script[setup]')
  scriptSetups.forEach((ss) => {
    const l = pipe(ss, lang)
    if (l && l.length > 0 && l !== 'ts')
      throw new Error(`Detected a <script setup> block which was using "${l}" as a language setting; if you want to write code in "${l}" try putting it into a normal <script> block as <script setup> is reserved for Typescript when using the vite-plugin-md plugin.\n - [ file: ${p.fileName}, node: ${toHtml(ss)} ]`)
  })

  const traditionalScripts = select(scripts.join('\n')).findAll('script:not([setup])')

  return { scriptSetups, traditionalScripts }
}

/**
 * Extracts "style" blocks along with any other custom blocks defined in the options
 * for this plugin. This call also mutates the `html` property to extract these custom
 * blocks.
 */
function extractCustomBlocks<
  B extends readonly GenericBuilder[],
  P extends Pipeline<'dom', B>,
>(p: P, options: ResolvedOptions<B>) {
  const styleBlocks = [
    ...select(p.html).findAll('style'),
    ...elementHashToArray(p.vueStyleBlocks),
  ]
  const html = select(p.html)
    .updateAll('style')(extract())
  let customBlocks: IElement[] = []
  for (const tag of options.customSfcBlocks) {
    const found = select(p.html).findAll(tag)
    html.updateAll(tag)(extract())
    if (found.length > 0)
      customBlocks = [...customBlocks, ...found]
  }

  p.html = html.toContainer()

  return { styleBlocks, customBlocks }
}

/** produces the defineExpose() call based on config */
function expose<
  P extends Pipeline<'dom', any>,
>(p: P) {
  const fm = p.frontmatter
  delete fm.excerpt

  const frontmatter = p.options.frontmatter && p.options.exposeFrontmatter
    ? fm
    : {}

  const excerpt = p.options.excerpt && p.options.exposeExcerpt
    ? JSON.stringify(p.excerpt)
    : undefined

  return `defineExpose({ frontmatter: ${JSON.stringify(frontmatter)}, excerpt: ${excerpt} })`
}

/**
 * Separates the various "blocks" in an SFC component
 */
export const extractBlocks = <B extends readonly any[]>() => transformer<B>()(
  'dom',
  (payload) => {
  // eslint-disable-next-line prefer-const
    let { options, frontmatter, head } = payload

    const { scriptSetups, traditionalScripts } = extractScriptBlocks(payload)
    const { styleBlocks, customBlocks } = extractCustomBlocks(payload, options)

    /** template blocks that will be applied below */
    const template = {
    /** adds the lines needed to include useHead() */
      useHead: head && options.headEnabled
        ? `import { useHead } from "@vueuse/head"\n  const head = ${JSON.stringify(head)}\n  useHead(head)`
        : '',
      importDefineExpose: options.frontmatter ? 'import { defineExpose } from \'vue\'' : '',
      /** exports the excerpt in a `<script>` block */
      excerptExport: `export const excerpt: string | undefined = ${JSON.stringify(payload.excerpt || '')}\n`,
      /**
     * export of frontmatter variable; intended for `<script>` block
     */
      frontmatter: [
        '/** frontmatter meta-data for MD page **/',
        'export interface Frontmatter {',
        '  title?: string\n  description?: string\n  subject?: string\n  category?: string\n  name?: string\n  excerpt?: string\n  image?: string\n  layout?: string\n  requiredAuth?: boolean\n  meta?: Record<string, any>[]',
        '  [key: string]: unknown',
        '}',
      `export const frontmatter: Frontmatter = ${options.exposeFrontmatter ? JSON.stringify(frontmatter) : '{}'}`,
      ].join('\n'),
      /** returning the 'frontmatter' property for external actors using Vue3 */
      vue3CompositionReturn: options.frontmatter ? 'return { frontmatter }' : '',
      /** return 'frontmatter' on the data property for Vue2 users */
      vue2DataExport: 'export default { data() { return { frontmatter, excerpt } } }',
      /** variables usable in page template */
      localVariables: Object.entries(frontmatter).reduce(
        (acc, [key, value]) => `${acc}\n${isVue2(options) ? 'export' : ''} const ${key} = ${JSON.stringify(value)}`,
        '',
      ).trimStart(),
    }

    const importDirectives: string[] = []
    const scriptSetupBlocks = scriptSetups.map(el => el.innerHTML)

    /** all userland non-import lines in `<setup script>` blocks */
    const nonImportDirectives = scriptSetupBlocks.map((line) => {
      if (line.startsWith('import')) {
        importDirectives.push(line)
        return ''
      }
      else { return line }
    }).filter(i => i).join('\n')

    const scriptSetup = isVue2(options)
    // Vue 2
      ? ''
    // Vue 3
      : wrap('script setup lang="ts"', [
        ...importDirectives,
        template.useHead,
        template.localVariables,
        expose(payload),
        nonImportDirectives,
        ...codeBlocksToArray(payload.vueCodeBlocks),
      ].filter(i => i).join('\n  '))

    const scriptBlocks = isVue2(options)
    // Vue 2
      ? [
          wrap('script lang="ts"', [
            template.localVariables,
            template.frontmatter,
            template.vue2DataExport,
          ].join('\n')),
          [
            ...traditionalScripts.map(el => el.outerHTML),
            ...(Object.keys(payload.vueCodeBlocks).length > 0
              ? createVue2ScriptBlock(payload.vueCodeBlocks)
              : []
            ),
          ].join('\n'),
        ].filter(i => i)
    // Vue3
      : [
          wrap('script lang="ts"', [
            template.frontmatter,
            template.excerptExport,
          ].join('\n')),
          // userland script blocks
          traditionalScripts.map(s => s.outerHTML).join('\n'),
        ].filter(i => i)

    const html = toHtml(payload.html)

    return {
      ...payload,
      stage: 'sfcBlocksExtracted',
      html,
      templateBlock: html,
      scriptSetup,
      scriptBlocks,
      styleBlocks: styleBlocks.map(s => s.outerHTML),
      customBlocks: customBlocks.map(s => s.outerHTML),
    }
  })

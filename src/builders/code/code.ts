import { PipelineStage } from '../../types'
import { createBuilder } from '../createBuilder'
import { fence } from './mdi'
import type { CodeOptions, PrismOptions } from './types/code-types'
import { Highlighter } from './types/code-types'

const PRISM_DEFAULTS: Partial<PrismOptions> = {
  engine: Highlighter.prism,
  plugins: [],
  init: () => {
    // do nothing by default
  },
  defaultLanguageForUnknown: 'bash',
  defaultLanguageForUnspecified: 'bash',
  defaultLanguage: undefined,
}
const SHIKI_DEFAULTS = {
  engine: Highlighter.shiki,
  theme: 'nord',
}

/**
 * `code` Builder API
 *
 * Provides highlighting of code features to `vite-plugin-md`
 */
export const code = createBuilder('code', PipelineStage.parser)
  .options<Partial<CodeOptions>>()
  .initializer()
  .handler(async (p, o) => {
    // ensure proper defaults for options
    const options = {
      highlightLines: true,
      lineNumbers: false,
      showLanguage: true,
      layoutStructure: 'flex-lines',
      ...(o.engine === Highlighter.shiki
        ? SHIKI_DEFAULTS
        : PRISM_DEFAULTS
      ),
      ...o,
    } as CodeOptions

    p.parser.use(await fence(p, options))

    return p
  })
  .meta({
    description: 'Provides highlighted code blocks via the Prism or Shiki styling ecosystems',
    parserRules: [{ ruleName: 'fence', usage: 'patches' }],
  })

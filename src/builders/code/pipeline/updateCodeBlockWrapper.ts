import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'
import { addClass, wrap } from '../utils'

/**
 * Adds classes to the code-block's global wrapper node.
 * This includes the language but also optionally 'line-numbers-mode'
 * if line numbers are meant to be displayed.
 */
export const updateCodeBlockWrapper = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    return {
      ...fence,
      codeBlockWrapper: pipe(
        fence.codeBlockWrapper,
        wrap('\n', '\n', fence.level),
        addClass(`language-${fence.lang}`),
        o.lineNumbers || fence.modifiers.includes(Modifier['#'])
          ? addClass('line-numbers-mode')
          : identity,
      ),
    }
  }

import { identity, pipe } from 'fp-ts/lib/function'
import type { IElement } from '@yankeeinlondon/happy-wrapper'
import { addClass, select } from '@yankeeinlondon/happy-wrapper'
import type { CodeBlockMeta, CodeOptions } from '../code-types'
import { highlightTokensToLines } from '../utils'

/**
 * If highlighted line numbers are configured, will add "highlight" class to lines specified
 * using both traditional Vuepress/Vitepress nomenclature or attribute/object notation
 */
export const highlightLines = (_o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  const hl = highlightTokensToLines(fence)

  const highlight = (el: IElement, idx: number) => pipe(
    el,
    hl.includes(idx + 1)
      ? addClass('highlight')
      : identity,
  )

  return {
    ...fence,
    trace: `Highlighted line(s) were: ${hl.join(', ')}`,

    code: select(fence.code)
      .updateAll('.code-line')(highlight)
      .toContainer(),
    lineNumbersWrapper: select(fence.lineNumbersWrapper)
      .updateAll('.line-number')(highlight)
      .toContainer(),
  }
}

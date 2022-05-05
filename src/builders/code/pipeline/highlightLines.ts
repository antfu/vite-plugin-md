import { identity, pipe } from 'fp-ts/lib/function'
import type { IElement } from 'happy-dom'
import { addClass, select } from 'happy-wrapper'
import type { CodeBlockMeta, CodeOptions } from '../types'

/** converts HighlightTokens to lines of code */
function linesToHighlight(fence: CodeBlockMeta<'dom'>): number[] {
  const lines: number[] = []

  fence.highlightTokens.forEach((t) => {
    switch (t.kind) {
      case 'line':
        lines.push(t.line)
        break
      case 'range':
        {
          let i = t.from
          while (i <= t.to) {
            lines.push(i)
            i++
          }
        }
        break
      case 'symbol':
        // TODO: need to implement this
    }
  })

  return lines
}

/**
 * If highlighted line numbers are configured, will add "highlight" class to lines specified
 * using both traditional Vuepress/Vitepress nomenclature or attribute/object notation
 */
export const highlightLines = (_o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  const hl = linesToHighlight(fence)

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
      .updateAll('.code-line')((el, idx) => highlight(el, idx as number))
      .toContainer(),
    lineNumbersWrapper: select(fence.lineNumbersWrapper)
      .updateAll('.line-number')((el, idx) => highlight(el, idx as number))
      .toContainer(),
  }
}

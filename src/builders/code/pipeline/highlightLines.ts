import type { DocumentFragment, IElement } from 'happy-dom'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { getClassList, select } from '../utils'

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

  const highlight = (doc: DocumentFragment, sel: string) => {
    const cb = (el: IElement) => {
      const classes = getClassList(el)
      let highlight = false
      hl.forEach((l) => {
        if (classes.includes(`line-${l}`))
          highlight = true
      })
      return highlight
    }
    return select(doc).addClassToEach('highlight')(sel, cb)
  }

  return {
    ...fence,
    trace: `Highlighted line(s) were: ${hl.join(', ')}`,

    code: highlight(fence.code, '.line').toContainer(),
    lineNumbersWrapper: highlight(fence.lineNumbersWrapper, '.line-number').toContainer(),
  }
}

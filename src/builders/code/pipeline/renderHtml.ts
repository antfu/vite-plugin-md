import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta } from '../types'
import { toHtml, wrapChildNodes } from '../utils'

function removeUndefined(items: (DocumentFragment | undefined)[]): DocumentFragment[] {
  return items.filter(i => i) as DocumentFragment[]
}

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  const children = removeUndefined([
    fence.heading,
    fence.pre,
    fence.lineNumbersWrapper,
    fence.footer,
  ])

  const node = pipe(
    fence.codeBlockWrapper,
    wrapChildNodes(children),
  )

  return {
    ...fence,
    html: toHtml(node),
  }
}

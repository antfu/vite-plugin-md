import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta } from '../types'
import { getHtmlFromNode, wrapChildNodes } from '../utils'

function removeUndefined(items: (DocumentFragment | undefined)[]): DocumentFragment[] {
  return items.filter(i => i) as DocumentFragment[]
}

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  const node = pipe(
    fence.codeBlockWrapper,
    wrapChildNodes(
      removeUndefined([fence.heading, fence.pre, fence.lineNumbersWrapper, fence.footer]),
    ),
  )

  return {
    ...fence,
    html: getHtmlFromNode(node),
  }
}

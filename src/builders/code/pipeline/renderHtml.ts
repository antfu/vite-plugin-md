import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'
import { into, select, toHtml } from '../utils'

function removeUndefined(items: (DocumentFragment | undefined)[]): DocumentFragment[] {
  return items.filter(i => i) as DocumentFragment[]
}

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  const children = removeUndefined([
    fence.heading,
    fence.pre,
    o.lineNumbers || fence.modifiers.includes(Modifier['#'])
      ? fence.lineNumbersWrapper
      : undefined,
    // fence.footer,
  ])
  const block = select(fence.codeBlockWrapper).first('.code-block')
  if (block)
    block.replaceWith(into(block)(children))
  if (fence.footer)
    fence.codeBlockWrapper.lastElementChild.append(fence.footer)

  return {
    ...fence,
    trace: `Finalized HTML is:\n${toHtml(fence.codeBlockWrapper)}`,

    html: toHtml(fence.codeBlockWrapper),
  }
}

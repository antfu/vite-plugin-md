import type { DocumentFragment } from 'happy-dom'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'
import { changeTagName, into, select, toHtml } from '../utils'

function removeUndefined(items: (DocumentFragment | undefined)[]): DocumentFragment[] {
  return items.filter(i => i) as DocumentFragment[]
}

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  // children of .code-block
  const children = removeUndefined([
    fence.heading,
    fence.pre,
    o.lineNumbers || fence.modifiers.includes(Modifier['#'])
      ? fence.lineNumbersWrapper
      : undefined,
  ])

  const codeWrapper = select(fence.codeBlockWrapper).findFirst('.code-block')

  // wrap children into .code-block
  if (codeWrapper)
    codeWrapper.replaceWith(into(codeWrapper)(children))
  else
    throw new Error(`Couldn't find the ".code-block" in the file ${p.fileName}`)

  if (fence.footer)
    fence.codeBlockWrapper.lastElementChild.append(fence.footer)

  if (o.layoutStructure === 'flex-lines')
    select(fence.codeBlockWrapper).updateAll('.line')(changeTagName('div'))

  const html = toHtml(fence.codeBlockWrapper)

  return {
    ...fence,
    trace: `Finalized HTML is:\n${toHtml(fence.codeBlockWrapper)}`,

    html,
  }
}

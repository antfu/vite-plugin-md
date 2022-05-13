import { toHtml } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../code-types'
import { flexLines } from './rendering/flex-lines'
import { tabularFormatting } from './rendering/tabular'

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  switch (o.layoutStructure) {
    case 'flex-lines':
      fence.codeBlockWrapper = flexLines(p, o, fence)
      break
    case 'tabular':
      fence.codeBlockWrapper = tabularFormatting(p, fence)
      break
  }

  if (fence.footer)
    fence.codeBlockWrapper.lastElementChild.append(fence.footer)

  const html = toHtml(fence.codeBlockWrapper)

  return {
    ...fence,
    trace: `Finalized HTML is:\n${toHtml(fence.codeBlockWrapper)}`,

    html,
  }
}

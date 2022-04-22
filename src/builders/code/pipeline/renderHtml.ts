import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'
import { changeTagName, into, select, toHtml } from '../utils'

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  fence.codeBlockWrapper = select(fence.codeBlockWrapper)
    .update(
      '.code-block',
      `Couldn't find the ".code-block" in the file ${p.fileName}`,
    )(el => into(el)([
      fence.pre,
      ...(o.lineNumbers || fence.modifiers.includes(Modifier['#'])
        ? [fence.lineNumbersWrapper]
        : []
      ),
    ]))
    .update(
      '.code-wrapper',
      `Couldn't find the ".code-wrapper" in the file ${p.fileName}`,
    )(el => fence.heading
      ? into(el)(fence.heading)
      : el,
    )
    .toContainer()

  if (fence.footer)
    fence.codeBlockWrapper.lastElementChild.append(fence.footer)

  if (o.layoutStructure === 'flex-lines') {
    select(fence.codeBlockWrapper)
      .updateAll('.line')(n => changeTagName('div')(n))
  }

  const html = toHtml(fence.codeBlockWrapper)

  return {
    ...fence,
    trace: `Finalized HTML is:\n${toHtml(fence.codeBlockWrapper)}`,

    html,
  }
}

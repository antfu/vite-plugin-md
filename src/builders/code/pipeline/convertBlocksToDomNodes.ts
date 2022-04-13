import type { Pipeline, PipelineStage } from '../../../types'
import type { BlockCallback, CodeBlockMeta, CodeOptions } from '../types'
import { htmlToDocFragment, queryNode, safeString } from '../utils'

function mergeClasses(
  payload: Pipeline<PipelineStage.parser>,
  optionConfig: string[] | BlockCallback<string[]> | undefined,
  fence: CodeBlockMeta<'code'>,
  prop: keyof CodeBlockMeta<'code'>['props'],
) {
  const baseClasses = optionConfig
    ? new Set<string>(typeof optionConfig === 'function'
      ? optionConfig(fence, '', {})
      : optionConfig,
    )
    : new Set<string>()
  const userDefined = fence.props[prop]
    ? new Set<string>(String(fence.props[prop]).split(/s+/g))
    : new Set<string>()

  return Array.from(new Set([...baseClasses, ...userDefined])).join(' ')
}

export const convertBlocksToDomNodes = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'dom'> => {
  const code = htmlToDocFragment(fence.code)
  const codeLinesCount = queryNode(code).all('.line').length

  const pre = htmlToDocFragment(fence.pre)
  const codeBlockWrapper = htmlToDocFragment(fence.codeBlockWrapper)
  const lineNumbersWrapper = htmlToDocFragment(fence.lineNumbersWrapper)

  const heading = fence.heading
    ? htmlToDocFragment(
      `<div ${fence.props.heading ? `class="${mergeClasses(p, o.headingClasses, fence, 'heading')}"` : ''}>${safeString(fence.heading)}</div>`,
    )
    : undefined

  const footer = fence.footer
    ? htmlToDocFragment(
      `<div ${fence.props.footer ? `class="${mergeClasses(p, o.footerClasses, fence, 'footer')}"` : ''}">${safeString(fence.footer)}</div>`,
    )
    : undefined

  return {
    ...fence,
    code,
    codeLinesCount,
    pre,
    codeBlockWrapper,
    lineNumbersWrapper,
    heading,
    footer,
  }
}

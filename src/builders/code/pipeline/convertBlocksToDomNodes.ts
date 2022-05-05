import { createFragment, safeString, select } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { BlockCallback, CodeBlockMeta, CodeOptions } from '../types'

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

/**
 * converts string representations to DOM nodes
 */
export const convertBlocksToDomNodes = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'dom'> => {
  const code = createFragment(fence.code)
  const codeLinesCount = select(code).findAll('.code-line').length

  const aboveTheFoldCode = fence.aboveTheFoldCode ? createFragment(fence.aboveTheFoldCode) : undefined

  const pre = createFragment(fence.pre)
  const codeBlockWrapper = createFragment(fence.codeBlockWrapper)
  const lineNumbersWrapper = createFragment(fence.lineNumbersWrapper)

  const heading = fence.heading
    ? createFragment(
      `<div ${fence.props.heading ? `class="${mergeClasses(p, o.headingClasses, fence, 'heading')}"` : ''}>${safeString(fence.heading)}</div>`,
    )
    : undefined

  const footer = fence.footer
    ? createFragment(
      `<div ${fence.props.footer ? `class="${mergeClasses(p, o.footerClasses, fence, 'footer')}"` : ''}">${safeString(fence.footer)}</div>`,
    )
    : undefined

  return {
    ...fence,
    code,
    codeLinesCount,
    aboveTheFoldCode,
    pre,
    codeBlockWrapper,
    lineNumbersWrapper,
    heading,
    footer,
  }
}

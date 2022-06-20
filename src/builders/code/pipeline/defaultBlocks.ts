import { identity, pipe } from 'fp-ts/lib/function'
import { addClass, append } from '@yankeeinlondon/happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { BlockCallback, CodeBlockMeta, CodeOptions } from '../code-types'

/**
 * provides initial defaults for the `pre`, `codeBlockWrapper`, and `lineNumbersWrapper` as
 * well as establish the blocks for `heading` and `footer`.
 */
export const defaultBlocks = (payload: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'code'>): CodeBlockMeta<'code'> => {
  /**
   * Resolves properties which can have either a discrete value or a callback
   */
  const resolver = <I>(identity: I) => <T>(prop: T | BlockCallback<T> | undefined) => typeof prop === 'function'
    ? (prop as BlockCallback<T>)(fence, payload.fileName, payload.frontmatter)
    : typeof prop === 'undefined'
      ? identity
      : prop

  const metaClasses: string[] = []
  if (fence.props.heading)
    metaClasses.push('with-heading')
  else
    metaClasses.push('no-heading')
  if (resolver(false)(o?.clipboard))
    metaClasses.push('with-clipboard')
  if (resolver(false)(o?.showLanguage))
    metaClasses.push('show-lang')

  /**
   * The heading row will always be defined but what it contains is determined by
   * configuration
   */
  const heading = pipe(
    '<div class="heading-row">',
    addClass(metaClasses),
    fence.props.heading
      ? append(
        `<div class="${resolver([])(o?.headingClasses).join(' ')}">${fence.props.heading}</div>`,
      )
      : identity,
    o?.clipboard
      ? append('<i-clipboard class="icon clipboard" @click="_copyClipboard" />')
      : identity,
    o?.showLanguage
      ? append('<span class="lang-display"></span>')
      : identity,
  )

  const footer = fence.props.footer
    ? `<div class="footer">${fence.props.footer}</div>`
    : undefined

  const codeBlockWrapper = `<div class="code-wrapper">${heading || ''}<div class="code-block"></div>${footer || ''}</div>`
  const pre = '<pre>\n</pre>\n'
  const lineNumbersWrapper = '<div class="line-numbers-wrapper"></div>\n'

  return {
    ...fence,
    pre,
    codeBlockWrapper,
    lineNumbersWrapper,
  }
}

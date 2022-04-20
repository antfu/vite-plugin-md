import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta } from '../types'
import { addClass, into, setAttribute, toHtml } from '../utils'

/**
 * updates the `pre` block with classes, style, and adds the code block in as
 * a child element.
 */
export const updatePreWrapper = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  const code = fence.aboveTheFoldCode
    ? into()(fence.aboveTheFoldCode, fence.code)
    : fence.code

  const pre = pipe(
    into(
      pipe(
        fence.pre,
        addClass(`language-${fence.lang}`),
        addClass(fence.props.class || ''),
        fence.props.style
          ? setAttribute('style')(fence.props.style)
          : identity,
      ),
    )(code),
    // wrap('\n', '\n', fence.level + 1),
  )

  return {
    ...fence,
    pre,
    trace:
      `the <pre> wrapper has classes and styles as well as containing the code:\n${toHtml(pre)}`,
  }
}

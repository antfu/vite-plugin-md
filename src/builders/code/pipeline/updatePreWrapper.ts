import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta } from '../types'
import { addClass, into, setAttribute, toHtml } from '../utils'

/**
 * updates the `pre` block with classes, style, and adds the code block in as
 * a child element.
 */
export const updatePreWrapper = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
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
    )(fence.code),
  )

  return {
    ...fence,
    pre,
    trace:
      `the <pre> wrapper has classes and styles as well as containing the code:\n${toHtml(pre)}`,
  }
}

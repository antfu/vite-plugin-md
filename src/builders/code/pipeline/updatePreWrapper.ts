import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta } from '../types'
import { addClass, setAttribute, wrapChildNodes, wrap } from '../utils'

/**
 * updates the `pre` block with classes, style, and adds the code block in as
 * a child element.
 */
export const updatePreWrapper = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  return {
    ...fence,
    pre: pipe(
      fence.pre,
      addClass(`language-${fence.lang}`),
      fence.props.class
        ? addClass(fence.props.class?.trim())
        : identity,
      fence.props.style
        ? setAttribute('style')(fence.props.style)
        : identity,

      wrapChildNodes(pipe(
        fence.code,
        // wrapWithText('\n'),
      )),
      wrap('\n', '\n'),
    ),
  }
}

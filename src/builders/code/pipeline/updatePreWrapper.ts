import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta } from '../types'
import { addAttributeToNode, addClassToNode, wrapChildNodes, wrapWithText } from '../utils'

/**
 * updates the `pre` block with classes, style, and adds the code block in as
 * a child element.
 */
export const updatePreWrapper = (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  return {
    ...fence,
    pre: pipe(
      fence.pre,
      addClassToNode(`language-${fence.lang}`),
      fence.props.class
        ? addClassToNode(fence.props.class?.trim())
        : identity,
      fence.props.style
        ? addAttributeToNode('style', fence.props.style)
        : identity,

      wrapChildNodes(fence.code),
      wrapWithText('\n', '\n'),
    ),
  }
}

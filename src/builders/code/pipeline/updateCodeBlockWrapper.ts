import { identity, pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'
import { addClass, select } from '../utils'

/**
 * Adds classes to the code-block's global wrapper node.
 * This includes the language but also optionally 'line-numbers-mode'
 * if line numbers are meant to be displayed.
 */
export const updateCodeBlockWrapper = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    const block = select(fence.codeBlockWrapper).first('.code-block')
    if (block) {
      block.replaceWith(pipe(
        block,
        addClass(`language-${fence.lang}`),
        o.lineNumbers || fence.modifiers.includes(Modifier['#'])
          ? addClass('line-numbers-mode')
          : identity,
        fence.externalFile
          ? addClass('external-ref')
          : identity,
        fence.aboveTheFoldCode
          ? addClass('with-inline-content')
          : identity,
      ))
    }
    else {
      throw new Error('Couldn\'t find the .code-block element in the code wrapper!')
    }

    return fence
    // return {
    //   ...fence,
    //   codeBlockWrapper: pipe(
    //     fence.codeBlockWrapper,
    //     wrap('\n', '\n', fence.level),
    //     addClass(`language-${fence.lang}`),
    //     o.lineNumbers || fence.modifiers.includes(Modifier['#'])
    //       ? addClass('line-numbers-mode')
    //       : identity,
    //   ),
    // }
  }

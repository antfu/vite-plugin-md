import { pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions } from '../types'
import {
  addClassToNode,
  htmlToDocFragment,
  wrapChildNodes,
} from '../utils'

/**
 * Builds up the full DOM tree for line numbers and puts it back into the
 * `lineNumbersWrapper` property. This is done regardless of whether lineNumbers
 * are turned on, this functions responsibility is only to ensure that if its needed
 * it is ready.
 */
export const updateLineNumbers = (_o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    for (let lineNumber = 1; fence.codeLinesCount >= lineNumber; lineNumber++) {
      const evenOdd = lineNumber % 2 === 0 ? 'even' : 'odd'
      const firstLast = lineNumber === 0
        ? 'first-row'
        : lineNumber === fence.codeLinesCount - 1
          ? 'last-row'
          : undefined
      const classes = [
        'line-number',
        evenOdd,
        firstLast,
        `line-${lineNumber}`,
      ].filter(i => i) as string[]

      fence.lineNumbersWrapper = pipe(
        fence.lineNumbersWrapper,
        wrapChildNodes(pipe(
          htmlToDocFragment(`<span>${lineNumber}</span>`),
          addClassToNode(classes),
        )),
      )
    }

    return fence
  }

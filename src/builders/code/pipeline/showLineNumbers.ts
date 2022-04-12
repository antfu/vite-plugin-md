import { pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions } from '../types'
import {
  addClassToNode,
  cloneNode,
  htmlToDocFragment,
  parentNodeWithChildren,
  removeClassFromDoc,
} from '../utils'

/**
 * Converts a simple line of code to a table row containing two colums
 * - column number
 * - code line
 */
const convertLinesToTableRows = (o: CodeOptions) => (lines: CodeBlockMeta<'lines'>['lines']) => {
  // iterate over each line and:
  // 1. wrap code with TD
  // 2. append a line-number TD fragment
  const newLines = lines.map((l, idx) => {
    /** the classname which is used to identify a "line" */
    const lineClass = typeof o.lineClass !== 'function'
      ? o.lineClass || 'line'
      : 'line'

    const lineNumber = idx + 1
    const codeCol = pipe(
      l, cloneNode,
      removeClassFromDoc(lineClass), addClassToNode('code-block'),
      parentNodeWithChildren('<td class="col-code">'),
    )
    const lineNumCol = htmlToDocFragment(`<td class="col-line-number">${lineNumber}</td>`)

    return parentNodeWithChildren(
      `<TR class='line row-${lineNumber} ${lineNumber % 2 === 0 ? 'even' : 'odd'}' />`,
    )([lineNumCol, codeCol])
  })

  return newLines
}

/**
 * If configured for line numbers, the appropriate HTML will be added
 * to display this at the line-level and a wrapper element will be
 * set in `wrapLines`
 */
export const showLineNumbers = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'lines'>): CodeBlockMeta<'lines'> => {
    const lines = pipe(
      fence.lines,
      convertLinesToTableRows(o),
    )

    const result = o.lineNumbers
      ? {
        ...fence,
        codeLinesCount: lines.length,
        wrapLines: '<table class="code-with-line-numbers" />',
        lines,
        props: {
          ...fence.props,
          'class': [...(fence.props?.class || '').split(/\s+/), 'line-numbers-mode'].join(' '),
          'data-codeLines': lines.length,
        },
      } as CodeBlockMeta<'lines'>
      : fence

    return result
  }

import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment, IElement } from 'happy-dom'
import {
  addClass,
  createElement,
  into,
  select,
  wrap,
} from 'happy-wrapper'
import type { CodeBlockMeta, CodeOptions } from '../code-types'

const evenOdd = (lineNumber: number) => (el: IElement) => lineNumber % 2 === 0
  ? addClass('even')(el)
  : addClass('odd')(el)

const firstLast = (lineNumber: number, lineCount: number) => (el: IElement) => lineNumber === 1
  ? addClass('first-row')(el)
  : lineNumber === lineCount
    ? addClass('last-row')(el)
    : el

const lineNumber = (i: number, aboveTheFold: number) => i + 1 - aboveTheFold

const specificLine = (i: number, aboveTheFold: number) => {
  return lineNumber(i, aboveTheFold) > 0
    ? `line-${lineNumber(i, aboveTheFold)}`
    : `negative-line-${Math.abs(lineNumber(i, aboveTheFold))}`
}

/**
 * Adds line number DOM elements for each code line; along with "above the fold"
 * lines if there are any
 */
const addLinesToContainer = (fence: CodeBlockMeta<'dom'>, o: CodeOptions, aboveTheFold = 0) => {
  return (wrapper: DocumentFragment) => {
    const children: IElement[] = []
    for (let lineNumber = 1 - aboveTheFold; fence.codeLinesCount >= lineNumber; lineNumber++) {
      const tagName = 'span'
      const child = createElement(`<${tagName} class="line-number">${lineNumber}</${tagName}>`)
      children.push(child)
    }

    return wrap(children)(wrapper)
  }
}

const addLineClasses = (aboveTheFold: number) => (el: IElement, idx = 0, total = 0) => pipe(
  el,
  evenOdd(lineNumber(idx, aboveTheFold)),
  firstLast(lineNumber(idx, aboveTheFold), total),
  addClass(specificLine(idx, aboveTheFold)),
)

/**
 * - Builds up the full DOM tree for line numbers and puts it back into the
 * `fence.lineNumbersWrapper` property.
 * - Adds classes for all _lines_ nodes (e.g., even/odd, first/last, etc.), this includes
 * normal code lines and "above the fold"
 */
export const updateLineNumbers = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    const linesAboveTheFold = 0
    const aboveTheFoldCode = fence.aboveTheFoldCode
      ? pipe(
        fence.aboveTheFoldCode,
        select,
        s => s.updateAll('.code-line')((el) => {
          const isEmptyLine = el.textContent.length === 0
          const isEmptyComment = el.textContent.trim() === '//'
          return isEmptyComment || isEmptyLine ? false : el
        }),
        s => s.toContainer(),
      )
      : undefined

    /** the code with meta-classes added and including the "aboveTheFold" code */
    const code: DocumentFragment = pipe(
      aboveTheFoldCode
        ? into()(aboveTheFoldCode, fence.code)
        : fence.code,
      select,
      s => s.updateAll('.code-line')(addLineClasses(linesAboveTheFold)),
      s => s.toContainer(),
    )

    const lineNumbersWrapper = pipe(
      fence.lineNumbersWrapper,
      addLinesToContainer(fence, o, linesAboveTheFold),
      select,
      s => s.updateAll('.code-line')(addLineClasses(linesAboveTheFold)),
      s => s.toContainer(),
    )

    return {
      ...fence,
      trace: `Processed ${fence.codeLinesCount} lines and put into fence.lineNumbersWrapper [the level was at ${fence.level}]. Also merged aboveTheFold code [${linesAboveTheFold} lines] with code (if needed) and added meta classes for for each line.`,
      aboveTheFoldCode, // frozen in pipeline now that incorporated into `code`
      code,
      lineNumbersWrapper,
    }
  }

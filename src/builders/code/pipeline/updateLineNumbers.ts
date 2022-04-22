import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta, CodeOptions } from '../types'
import {
  addClass,
  createFragment,
  into,
  select,
  toHtml,
} from '../utils'

const applyLineClasses = (
  fence: CodeBlockMeta<'dom'>,
  genericLineClass: string,
  aboveTheFold = 0,
) => (section: DocumentFragment) => {
  const dom = select(section)
  const generics = dom.findAll(`.${genericLineClass.replace(/^\./, '')}`)
  const evenOdd = (lineNumber: number) => lineNumber % 2 === 0 ? 'even' : 'odd'
  const firstLast = (lineNumber: number) => lineNumber === 0
    ? 'first-row'
    : lineNumber === fence.codeLinesCount
      ? 'last-row'
      : undefined

  generics.forEach((el, idx) => {
    const lineNumber = idx + 1 - aboveTheFold
    const classes = [
      // specific line class
      `${lineNumber > 0 ? 'line' : 'negative-line'}-${lineNumber}`,
      evenOdd(lineNumber),
      firstLast(lineNumber),
    ].filter(i => i) as string[]

    el.replaceWith(
      pipe(
        el,
        addClass(classes),
      ),
    )
  })

  return section
}

/**
 * - Builds up the full DOM tree for line numbers and puts it back into the
 * `fence.lineNumbersWrapper` property.
 * - Adds classes for all _lines_ nodes (e.g., even/odd, first/last, etc.)
 */
export const updateLineNumbers = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    const addLines = (aboveTheFold = 0) => {
      const siblings: DocumentFragment[] = []
      for (let lineNumber = 1 - aboveTheFold; fence.codeLinesCount >= lineNumber; lineNumber++) {
        const tagName = o.layoutStructure === 'flex-lines' ? 'div' : 'span'
        siblings.push(
          createFragment(`<${tagName} class="line-number">${lineNumber}</${tagName}>`),
        )
      }
      return siblings
    }

    let aboveTheFold = 0
    const aboveTheFoldCode = fence.aboveTheFoldCode
      ? pipe(
        fence.aboveTheFoldCode,
        select,
        s => s.updateAll('.line-above')((el, idx, total) => {
          aboveTheFold = total
          return pipe(
            el,
            addClass(['line']),
          )
        }).toContainer(),
      )
      : undefined

    const code = pipe(
      // merge in aboveTheFold (if needed)
      aboveTheFoldCode
        ? createFragment([toHtml(aboveTheFoldCode), toHtml(fence.code)].join(''))
        : fence.code,
      // add meta classes across all lines of code
      applyLineClasses(fence, 'line', aboveTheFold),
    )

    return {
      ...fence,
      trace: `Processed ${fence.codeLinesCount} lines and put into fence.lineNumbersWrapper [the level was at ${fence.level}]. Also merged aboveTheFold code [${aboveTheFold} lines] with code (if needed) and added meta classes for for each line.`,
      aboveTheFoldCode,
      code,
      lineNumbersWrapper: pipe(
        addLines(aboveTheFold),
        into(fence.lineNumbersWrapper),
        applyLineClasses(fence, 'line-number', aboveTheFold),
      ),
    }
  }

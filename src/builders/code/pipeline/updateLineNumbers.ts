import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta, CodeOptions } from '../types'
import {
  addClass,
  createFragment,
  into,
  select,
  toHtml,
  wrap,
} from '../utils'

/**
 * Builds up the full DOM tree for line numbers and puts it back into the
 * `fence.lineNumbersWrapper` property.
 *
 * It also adds classes on the code lines in `fence.code` and `fence.aboveTheFoldCode`
 */
export const updateLineNumbers = (_o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    // indent the wrapper 1 tab stop
    // fence.lineNumbersWrapper = wrap('\n', '\n', fence.level + 1)(fence.lineNumbersWrapper)

    const applyLineClasses = (
      genericLineClass: string,
      specificPrefix: string,
    ) => (section: DocumentFragment) => {
      const dom = select(section)
      const generics = dom.all(`.${genericLineClass.replace(/^\./, '')}`)
      const evenOdd = (lineNumber: number) => lineNumber % 2 === 0 ? 'even' : 'odd'
      const firstLast = (lineNumber: number) => lineNumber === 0
        ? 'first-row'
        : lineNumber === fence.codeLinesCount
          ? 'last-row'
          : undefined

      generics.forEach((el, idx) => {
        const classes = [
          `${specificPrefix}-${idx + 1}`,
          evenOdd(idx + 1),
          firstLast(idx + 1),
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

    const addLines = () => {
      const siblings: DocumentFragment[] = []
      for (let lineNumber = 1; fence.codeLinesCount >= lineNumber; lineNumber++) {
        siblings.push(
          pipe(
            createFragment(`<span class="line-number">${lineNumber}</span>`),
            wrap('\n', undefined, fence.level + 2),
          ),
        )
      }
      return siblings
    }

    const aboveTheFoldCode = fence.aboveTheFoldCode
      ? pipe(fence.aboveTheFoldCode, applyLineClasses('line-above', 'above-line'))
      : undefined

    return {
      ...fence,
      trace: `Processed ${fence.codeLinesCount} lines and put into fence.lineNumbersWrapper [the level was at ${fence.level}]`,

      code: pipe(
        fence.code,
        applyLineClasses('line', 'line'),
      ),
      aboveTheFoldCode,
      lineNumbersWrapper: pipe(
        addLines(),
        into(fence.lineNumbersWrapper),
        applyLineClasses('line-number', 'line'),
        wrap('\n', '\n'),
      ),
    }
  }

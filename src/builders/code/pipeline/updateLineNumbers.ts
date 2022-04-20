import { pipe } from 'fp-ts/lib/function'
import type { DocumentFragment } from 'happy-dom'
import type { CodeBlockMeta, CodeOptions } from '../types'
import {
  addClass,
  createFragment,
  into,
  removeClass,
  select,
} from '../utils'

const applyLineClasses = (
  fence: CodeBlockMeta<'dom'>,
  genericLineClass: string,
  specificPrefix: string,
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

/**
 * Builds up the full DOM tree for line numbers and puts it back into the
 * `fence.lineNumbersWrapper` property.
 *
 * It also adds classes on the code lines in `fence.code` and `fence.aboveTheFoldCode`
 */
export const updateLineNumbers = (o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    const addLines = () => {
      const siblings: DocumentFragment[] = []
      for (let lineNumber = 1; fence.codeLinesCount >= lineNumber; lineNumber++) {
        const tagName = o.layoutStructure === 'flex-lines' ? 'div' : 'span'
        siblings.push(
          createFragment(`<${tagName} class="line-number">${lineNumber}</${tagName}>`),
        )
      }
      return siblings
    }

    const aboveTheFoldCode = fence.aboveTheFoldCode
      ? pipe(
        fence.aboveTheFoldCode,
        applyLineClasses(fence, 'line-above', 'above-line'),
        select,
        s => s.updateAll('.line-above')((el, idx, total) => {
          return pipe(
            el,
            addClass(['line']),
            addClass(`negative-line-${total - idx - 1}`),
            removeClass('line-above'),
          )
        }).toContainer(),
      )
      : undefined

    return {
      ...fence,
      trace: `Processed ${fence.codeLinesCount} lines and put into fence.lineNumbersWrapper [the level was at ${fence.level}]`,

      code: pipe(
        fence.code,
        applyLineClasses(fence, 'line', 'line'),
      ),
      aboveTheFoldCode,
      lineNumbersWrapper: pipe(
        addLines(),
        into(fence.lineNumbersWrapper),
        applyLineClasses(fence, 'line-number', 'line'),
      ),
    }
  }

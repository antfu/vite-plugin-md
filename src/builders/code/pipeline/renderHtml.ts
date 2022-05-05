import { flow, identity, pipe } from 'fp-ts/lib/function'
import type { IElement } from 'happy-wrapper'
import { addClass, before, changeTagName, clone, createElement, createFragment, describeNode, filterClasses, getClassList, inspect, into, prepend, select, toHtml, wrap } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderHtml = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'complete'> => {
  // determine if line numbers are to be incorporated into output
  const hasLineNumbers = o.lineNumbers || fence.modifiers.includes(Modifier['#'])
  const lineNumbersWrapper = hasLineNumbers ? fence.lineNumbersWrapper : createFragment()

  /**
   * in 'flex-lines' layout we'll use a strategy similar to what is used in Vite/Vuepress:
   *
   * 1. `pre` has whitespace control but not text spacing
   * 2. line numbers are displayed _after_ the code and using absolute positioning to
   * appear next to the code
   */
  const flexLines = () => pipe(
    fence.codeBlockWrapper,
    select,
    // .code-wrapper
    s => s.update(
      '.code-block',
        `Couldn't find the ".code-wrapper" in the file ${p.fileName}`,
    )(el => fence.heading
      ? before(fence.heading)(el)
      : el,
    ),
    // wrap in PRE and line number sections
    s => s.update(
      '.code-block',
        `Couldn't find the ".code-block" in the file ${p.fileName}`,
    )(wrap(fence.pre, lineNumbersWrapper)),
    // we'll use DIV's -- a block element -- to give PRE's whitespace
    // property jurisdiction to create a new line
    // whereas with Prism's output we're just getting SPANs
    s => s.updateAll('.code-line')(changeTagName('div')),
    s => s.toContainer(),
  )

  /**
   * In tabular structure, code looks like (where `pre` tag is replaced with `table`):
   * ```html
   * <table class="lang-xxx" data-lang="xxx">
   *    <tr class="heading"><th>heading</th></tr>
   *    <tr class="row line line-1 odd first-line">
   *      <td class="line-number">...</td>
   *      <td class="code-line">...</td>
   *    </tr>
   * </table>
   * ```
   */
  const tabularFormatting = () => {
    const toTable = changeTagName('table')
    const toTD = changeTagName('td')
    const toTH = changeTagName('th')
    const codeLine = (el: IElement) => getClassList(el).filter(i => i.startsWith('line-')).join(' ')
    const highlight = (el: IElement) => getClassList(el).includes('highlight') ? ['highlight'] : []

    const table = select(fence.pre)
      .update()(toTable)
      .update()(
        // if there's a "heading" then it will be the first row of the table
        fence.heading
          ? prepend(toTH(fence.heading.firstElementChild))
          : identity,
      )
      .updateAll('.code-line')((el) => {
        let misplaced: string[] = []
        const removed = (classes: string[]) => {
          misplaced = classes
        }

        const el2 = pipe(
          el,
          toTD,
          filterClasses(removed, /line-{1,2}[0-9]/, 'odd', 'even', 'first-row', 'last-row'),
          into(
            pipe('<tr class="code-row">', createElement, addClass(misplaced)),
          ),
          // (el) => {
          //   const klasses = [codeLine(el), highlight(el), misplaced].flat()

          //   const tr = pipe('<tr class="code-row"></tr>', createElement, addClass(klasses))
          //   const lineNumber = createElement(`<td class="line-number">${codeLine(el).replace('line-', '')}</td>`)
          //   const row = wrap(lineNumber, clone(el))(tr)

          //   el.replaceWith(row)
          //   return el
          // },
        )

        console.log('TR', pipe('<tr class="code-row"></tr>', createElement, addClass(misplaced), toHtml))

        console.log('DISCARD\n', misplaced)
        console.log('EL\n', toHtml(el2))
        console.log('PARENT\n', toHtml(el2.parentNode))

        return el
      })
      .toContainer()

    const codeBlockWrapper = select(fence.codeBlockWrapper)
      .update(
        '.code-block',
        `Couldn't find the ".code-block" in the file ${p.fileName}`,
      )(codeBlock => into(codeBlock)([table]))
      .toContainer()

    return codeBlockWrapper
  }

  switch (o.layoutStructure) {
    case 'flex-lines':
      fence.codeBlockWrapper = flexLines()
      break
    case 'tabular':
      fence.codeBlockWrapper = tabularFormatting()
      break
  }

  if (fence.footer)
    fence.codeBlockWrapper.lastElementChild.append(fence.footer)

  const html = toHtml(fence.codeBlockWrapper)

  return {
    ...fence,
    trace: `Finalized HTML is:\n${toHtml(fence.codeBlockWrapper)}`,

    html,
  }
}

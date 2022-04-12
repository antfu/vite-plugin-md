import { pipe } from 'fp-ts/lib/function'
import type { CodeBlockMeta, CodeOptions } from '../types'
import { addClassToNode } from '../utils'

function isRangeTuple(value: unknown): value is [from: number, to: number] {
  return Array.isArray(value) && value.length === 2 && value.every(i => typeof i === 'number')
}

function linesToHighlight(info: CodeBlockMeta<'lines'>['props']['hightlight']): number[] {
  console.log({ info })

  switch (typeof info) {
    case 'number':
      return [info]
    case 'object':
      if (isRangeTuple(info)) {
        const values = []
        // eslint-disable-next-line prefer-const
        let [from, to] = info
        while (from <= to)
          values.push(from++)
        return values
      }
      else if (Array.isArray(info)) {
        return info.flatMap(i => linesToHighlight(i as CodeBlockMeta<'lines'>['props']['hightlight']))
      }
      else if ('kind' in info && 'name' in info) {
        // TODO: build out
        return []
      }
      throw new Error(`Problems using the highlight information provided: ${JSON.stringify(info)}`)
    default:
      return []
  }
}

/**
 * If highlighted line numbers are configured, will add "highlight" class to lines specified
 * using both traditional Vuepress/Vitepress nomenclature or attribute/object notation
 *
 * Note: by the time we're _here_ both methods of indicating intent to highlight has been
 * expressed in the `props.highlight` prop and the content we must modify is
 * inside of the code block
 */
export const highlightLines = (o: CodeOptions) => (fence: CodeBlockMeta<'lines'>) => {
  const hl = linesToHighlight(fence.props.highlight)

  return o.lineNumbers && fence.props.hightlight
    ? {
      ...fence,
      lines: fence.lines.map((l, idx) => hl.includes(idx + 1)
        ? pipe(l, addClassToNode('highlight'))
        : l,
      ),
    }
    : fence
}

import type { CodeBlockMeta, CodeOptions } from '../types'
import { Modifier } from '../types'

function isRangeTuple(value: unknown): value is [from: number, to: number] {
  return Array.isArray(value) && value.length === 2 && value.every(i => typeof i === 'number')
}

function linesToHighlight(info: CodeBlockMeta<'dom'>['props']['hightlight']): number[] {
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
        return info.flatMap(i => linesToHighlight(i as CodeBlockMeta<'dom'>['props']['hightlight']))
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
 */
export const highlightLines = (_o: CodeOptions) => (fence: CodeBlockMeta<'dom'>) => {
  const hl = linesToHighlight(fence.props.highlight)
  if (fence.props.hightlight) {
    fence.code.querySelectorAll('.line').forEach((line, idx) => {
      if (hl.includes(idx)) {
        line.setAttribute(
          'class',
          [line.getAttribute('class').split(/\s+/g), 'highlight'].join(' ').trim(),
        )
      }
    })

    // if (o.lineNumbers || fence.modifiers.includes(Modifier['#'])) {
    fence.code.querySelectorAll('.line-number').forEach((line, idx) => {
      if (hl.includes(idx)) {
        line.setAttribute(
          'class',
          [line.getAttribute('class').split(/\s+/g), 'highlight'].join(' ').trim(),
        )
      }
    })
  }

  return fence
}

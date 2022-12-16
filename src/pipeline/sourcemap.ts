import type MarkdownIt from 'markdown-it'
import type { ExistingRawSourceMap } from 'rollup'
import { SourceMapGenerator } from 'source-map-js'
import type { GenericBuilder } from '../types/core'
import { transformer } from '../utils'

const splitRE = /\r?\n/g
const emptyRE = /^(?:\/\/)?\s*$/
const scriptRe = /(<!--)?\s*<\/?script\b[^>]*>(-->)?/g

export function extractScriptTag(md: string) {
  const lines = md.split(splitRE)
  const tag = []
  for (let i = 0, len = lines.length; i < len; i++) {
    if (scriptRe.test(lines[i]))
      tag.push(lines[i])
  }

  return tag
}

function generateSourceMap(
  filename: string,
  source: string,
  generated: string,
  parser: MarkdownIt,
) {
  const map = new SourceMapGenerator({
    file: filename.replace(/\\/g, '/'),
    sourceRoot: '',
  })
  map.setSourceContent(filename, source)

  const contentLineMap = new Map<string, number>()
  let countSR = 0
  let countGE = 0
  let prevGE = ''
  const generatedArr = generated.split(splitRE)
  const originalArr = source.split(splitRE)

  for (let i = 0, len = generatedArr.length; i < len; i++) {
    if (!emptyRE.test(generatedArr[i]))
      prevGE = generatedArr[i]
    else break
  }

  originalArr.forEach((line, index) => {
    if (line && !emptyRE.test(line)) {
      const renderedLine = parser.render(line).trim()
      if (!contentLineMap.has(renderedLine)) {
        countSR = 0
        contentLineMap.set(renderedLine, index + 1)
      }
      else {
        contentLineMap.set(renderedLine + countSR++, index + 1)
      }
    }
  })

  generatedArr.forEach((line, index) => {
    if (line && !emptyRE.test(line)) {
      const renderedLine = parser.render(line).trim()
      let originalLine = index + 1
      if (prevGE === line) {
        originalLine = contentLineMap.get(renderedLine + countGE++) || originalLine
      }
      else {
        countGE = 0
        originalLine = contentLineMap.get(renderedLine) || originalLine
      }

      prevGE = line
      const generatedLine = index + 1

      for (let i = 0, len = line.length; i < len; i++) {
        if (!/\s/.test(line[i])) {
          map.addMapping({
            source: filename,
            original: {
              line: originalLine,
              column: i,
            },
            generated: {
              line: generatedLine,
              column: i,
            },
          })
        }
      }
    }
  })

  return JSON.parse(map.toString()) as ExistingRawSourceMap
}

export const sourcemap = <B extends readonly GenericBuilder[]>() => transformer<B>()(
  'closeout',
  (payload) => {
    const { fileName, parser, content, component } = payload
    // add a sourcemap assuming the fileName is stated (which
    // should always be the case for real files but not all tests)
    return fileName && fileName.trim().length > 0
      ? {
          ...payload,
          map: generateSourceMap(
            fileName,
            content,
            component,
            parser,
          ),
        }
      : payload
  })

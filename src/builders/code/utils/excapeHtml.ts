import { keys } from '../../../utils'

const HTML_ESCAPE_TEST_RE = /["&<>]/
const HTML_ESCAPE_REPLACE_RE = /["&<>]/g
const HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

function replaceUnsafeChar(ch: string): string {
  if (ch in keys(HTML_REPLACEMENTS)) {
    return HTML_REPLACEMENTS[ch as keyof typeof HTML_REPLACEMENTS]
  }
  else {
    console.error(`character ["${ch}"] sent to replaceUnsafeChar(ch) was not recognized!`)
    return ''
  }
}

export function escapeHtml(str: string) {
  if (HTML_ESCAPE_TEST_RE.test(str))
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)

  return str
}

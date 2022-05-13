import { toHtml } from 'happy-wrapper'
import type { CodeBlockMeta, CodeParsingStage } from '../code-types'

export const trace = (msg = '') => <T extends CodeParsingStage>(fence: CodeBlockMeta<T>): CodeBlockMeta<T> => {
  // eslint-disable-next-line no-console
  console.log(msg, {
    code: typeof fence.code === 'string' ? fence.code : toHtml(fence.code),
    wrapper: typeof fence.codeBlockWrapper === 'string'
      ? fence.codeBlockWrapper
      : toHtml(fence.codeBlockWrapper),
    lines: typeof fence.lineNumbersWrapper === 'string'
      ? fence.lineNumbersWrapper
      : toHtml(fence.lineNumbersWrapper),
    ...(fence.trace ? { message: fence.trace } : {}),
  })

  return fence
}

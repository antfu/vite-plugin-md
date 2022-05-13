import { flow } from 'fp-ts/lib/function'
import { append, createTextNode, select } from 'happy-wrapper'
import type { CodeBlockMeta, CodeOptions } from '../code-types'

export const addLanguage = (o: CodeOptions) => (
  fence: CodeBlockMeta<'dom'>,
): CodeBlockMeta<'dom'> => {
  if (o.showLanguage) {
    fence.codeBlockWrapper = select(fence.codeBlockWrapper)
      .update('.lang-display')(
        flow(append(createTextNode(fence.requestedLang))),
      )
      .toContainer()
  }

  return fence
}

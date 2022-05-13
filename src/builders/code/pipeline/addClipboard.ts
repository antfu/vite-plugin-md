import { pipe } from 'fp-ts/lib/function'
import { addClass, addVueEvent, append, select } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { BlockCallback, CodeBlockMeta, CodeOptions } from '../code-types'

const CLIPBOARD = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="clipboard" viewBox="0 0 256 256"><path fill="currentColor" d="M166 152a6 6 0 0 1-6 6H96a6 6 0 0 1 0-12h64a6 6 0 0 1 6 6Zm-6-38H96a6 6 0 0 0 0 12h64a6 6 0 0 0 0-12Zm54-66v168a14 14 0 0 1-14 14H56a14 14 0 0 1-14-14V48a14 14 0 0 1 14-14h37.2a45.8 45.8 0 0 1 69.6 0H200a14 14 0 0 1 14 14ZM94 64v2h68v-2a34 34 0 0 0-68 0Zm108-16a2 2 0 0 0-2-2h-29.7a44.9 44.9 0 0 1 3.7 18v8a6 6 0 0 1-6 6H88a6 6 0 0 1-6-6v-8a44.9 44.9 0 0 1 3.7-18H56a2 2 0 0 0-2 2v168a2 2 0 0 0 2 2h144a2 2 0 0 0 2-2Z"/></svg>'

export const addClipboard = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) => (
  fence: CodeBlockMeta<'dom'>,
): CodeBlockMeta<'dom'> => {
  const test = (prop: boolean | BlockCallback<boolean>) => typeof prop === 'boolean'
    ? prop
    : prop ? prop(fence, p.fileName, p.frontmatter) : false

  if (o?.clipboard || test(fence.props?.clipboard)) {
    fence.codeBlockWrapper = select(fence.codeBlockWrapper)
      .update('.lang-display')(
        el => pipe(
          el,
          append(CLIPBOARD),
          addClass('use-clipboard'),
          addVueEvent('onClick', 'copyToClipboard(\'testing\')'),
        ),
      )
      .toContainer()
  }

  if (test(o.provideClipboardFunctionality) || o?.clipboard || test(fence.props?.clipboard)) {
    const script = `const clipboardAvailable = () => !!navigator?.clipboard?.writeText
  const copyToClipboard = (text) => {
    navigator?.clipboard?.writeText(text)
  }\n`
    p.addCodeBlock('clipboard', script)
  }

  return fence
}

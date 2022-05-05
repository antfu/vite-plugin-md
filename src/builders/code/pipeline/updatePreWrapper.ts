import { identity, pipe } from 'fp-ts/lib/function'
import { addClass, into, setAttribute, toHtml, DocumentFragment } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta } from '../types'
import { Modifier } from '../types'

/**
 * Updates the `pre` block with classes, style, and adds the code block in as
 * a child element.
 *
 * If there is any "above the fold" code then this is merged into the code
 * block here.
 */
export const updatePreWrapper = (p: Pipeline<PipelineStage.parser>) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  const code = fence.aboveTheFoldCode ? [fence.code, fence.aboveTheFoldCode] : [fence.code]
  
  const pre = pipe(
    into(
      pipe(
        fence.pre,
        addClass(`language-${fence.lang}`),
        setAttribute('data-lang')(fence.requestedLang),
        addClass(fence.props.class || ''),
        fence.props.style
          ? setAttribute('style')(fence.props.style)
          : identity,
        (fence.modifiers.includes(Modifier['!']) && !p.options.escapeCodeTagInterpolation)
      || (!fence.modifiers.includes(Modifier['!']) && p.options.escapeCodeTagInterpolation)
          ? setAttribute('v-pre')('true')
          : identity,
      ),
    )(...code),
  )

  return {
    ...fence,
    pre,
    trace:
      `the <pre> wrapper has classes and styles as well as containing the code:\n${toHtml(pre)}`,
  }
}

import { flow, identity } from 'fp-ts/lib/function'
import { addClass, select, setAttribute } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../code-types'
import { Modifier } from '../code-types'

/**
 * Adds classes to the code-block's global wrapper node.
 * This includes the language but also optionally 'line-numbers-mode'
 * if line numbers are meant to be displayed.
 */
export const updateCodeBlockWrapper = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    fence.codeBlockWrapper = select(fence.codeBlockWrapper)
      .update(
        '.code-block',
        'Problems updating the code-block wrapper for the file!',
      )(flow(
        addClass(`language-${fence.lang}`),
        setAttribute('data-lang')(fence.requestedLang),
        setAttribute('data-modifiers')(fence.modifiers?.join(',') || ''),
        o.lineNumbers || fence.modifiers.includes(Modifier['#'])
          ? addClass('line-numbers-mode')
          : addClass('no-line-numbers'),
        fence.externalFile
          ? addClass('external-ref')
          : identity,
        fence.aboveTheFoldCode
          ? addClass('with-inline-content')
          : identity,
      ),
      ).toContainer()

    return fence
  }

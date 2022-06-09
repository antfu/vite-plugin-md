import type { CodeBlockMeta, CodeOptions } from '../code-types'
import type { CodeBlockSummary, Pipeline, PipelineStage } from '../../../types'
import { highlightTokensToLines } from '../utils'

export const updateFrontmatterWithCodeBlock = (
  p: Pipeline<PipelineStage.parser>,
  o: CodeOptions,
) => (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
  if (o.injectIntoFrontmatter) {
    const info: CodeBlockSummary = {
      source: fence.props.filename,
      requestedLang: fence.requestedLang,
      parsedLang: fence.lang,
      props: fence.props,
      codeLines: fence.codeLinesCount,
      linesHighlighted: highlightTokensToLines(fence),
    }
    // mutate frontmatter to include code block info
    p.frontmatter = {
      ...p.frontmatter,
      _codeBlocks: p.frontmatter._codeBlocks
        ? [...p.frontmatter._codeBlocks, info]
        : [info],
    }
  }

  return fence
}

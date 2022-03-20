import type { Pipeline, PipelineStage } from '../@types'

/**
 * Wraps the HTML with DIV and/or a VueJS component
 */
export function wrapHtml(payload: Pipeline<PipelineStage.parsed>): Pipeline<PipelineStage.parsed> {
  const { options: { wrapperClasses, wrapperComponent }, html, frontmatter, excerpt } = payload
  let updated = html

  if (wrapperClasses)
    updated = `<div class="${wrapperClasses}">${html}</div>`
  else
    updated = `<div>${html}</div>`

  // if we wrap with component, make sure frontmatter props are passed down
  if (wrapperComponent)
    updated = `<${wrapperComponent}${frontmatter ? ' :frontmatter="frontmatter"' : ''}${excerpt ? ' :excerpt="excerpt"' : ''}>${html}</${wrapperComponent}>`

  return { ...payload, html: updated }
}

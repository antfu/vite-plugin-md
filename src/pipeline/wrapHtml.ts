import { transformer } from '../utils'

/**
 * Wraps the HTML with DIV and/or a VueJS component
 */
export const wrapHtml = transformer('wrapHtml', 'parsed', 'parsed', (payload) => {
  const { options: { wrapperClasses, wrapperComponent }, html, frontmatter } = payload
  let updated = html

  if (wrapperClasses)
    updated = `<div class="${wrapperClasses}">${html}</div>`
  else
    updated = `<div>${html}</div>`

  // if we wrap with component, make sure frontmatter props
  // are passed down
  if (wrapperComponent)
    updated = `<${wrapperComponent}${frontmatter ? ' :frontmatter="frontmatter"' : ''}${updated}</${wrapperComponent}>`

  return { ...payload, html: updated }
})

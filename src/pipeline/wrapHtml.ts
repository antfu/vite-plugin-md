import type { GenericBuilder } from '../types/core'
import { transformer } from '../utils'

/**
 * Wraps the HTML with DIV and/or a VueJS component
 */
export const wrapHtml = <B extends readonly GenericBuilder[]>() => transformer<B>()(
  'parsed',
  (payload) => {
    const { options: { wrapperClasses, wrapperComponent }, html, frontmatter } = payload
    let updated = html

    if (wrapperClasses)
      updated = `<div class="${wrapperClasses}">${html}</div>`
    else
      updated = `<div>${html}</div>`

    // if we wrap with component, make sure frontmatter props
    // are passed down
    if (wrapperComponent)
      updated = `<${wrapperComponent}${frontmatter ? ' :frontmatter="frontmatter"' : ''}>${updated}</${wrapperComponent}>`

    // if (viteConfig.mode === 'production') {
    //   // console.log('SSG:', process.env.SSG)

    //   payload.setSsgTitle(frontmatter?.title || ' ')
    // }

    return { ...payload, html: updated }
  })

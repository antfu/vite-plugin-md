import type { IElement } from 'happy-dom'
import { transformer } from '../utils'
import { clone, select } from '../builders/code/utils/happyDom'

const wrappedFrontmatter = /%7B%7B(.*)%7D%7D/
// const staticallyReplace = (bare: string, fm: Frontmatter) => fm[bare] ? String(fm[bare]) : 'missing-frontmatter-prop'
const restoreBrackets = (bare: string) => `{{${bare}}}`

/**
 * All links that contained references to frontmatter content
 * and were inside of image references or links would have been URL encoded
 * in a way that the curly brackets is no longer going to be interpreted by
 * VueJS. This function will re-establish the intent of the author.
 */
export const repairFrontmatterLinks = transformer('repairFrontmatterLinks', 'parsed', 'parsed', (payload) => {
  const update = (attr: string) => (el: IElement) => {
    const prop = el.getAttribute(attr)
    if (wrappedFrontmatter.test(prop)) {
      el.setAttribute(attr,
        restoreBrackets(prop.replace(wrappedFrontmatter, '$1')),
      )
    }

    return clone(el)
  }

  payload.html = select(payload.html)
    .updateAll('img')(update('src'))
    .updateAll('iframe')(update('src'))
    .updateAll('srcset')(update('src'))
    .updateAll('a')(update('href'))
    .updateAll('link')(update('href'))
    .updateAll('prefetch')(update('href'))
    .toContainer()

  return payload
})

import { getClassList, select, setAttribute } from 'happy-wrapper'
import { transformer } from '../utils'

/**
 * Modifies the HTML based on the configuration of `options.
 * escapeCodeTagInterpolation` and the fenced code blocks language
 * (if language starts `!` then options configuration is reversed).
 *
 * Because we are looking at the fenced language, we'll also add that to
 * the payload being passed through as this could be valuable for _search_
 * or other meta features.
 */
export const escapeCodeTagInterpolation = transformer(
  'escapeCodeTagInterpolation',
  'dom', 'dom',
  (payload) => {
    const { options: { escapeCodeTagInterpolation, usingBuilder }, html: dom } = payload
    const addVPre = setAttribute('v-pre')('true')

    const html = usingBuilder('code')
      ? dom
      : select(dom)
      // add "v-pre" to pre tag where appropriate
        .updateAll('pre')((pre) => {
          const code = select(pre).findFirst('code', 'no <code> block found in <pre>!')
          const lang = getClassList(code).find(c => c.startsWith('language-'))
          if (lang) {
            const hasNegation = lang.includes('!')
            const shouldSetVPre = (escapeCodeTagInterpolation && !hasNegation)
            || (!escapeCodeTagInterpolation && hasNegation)

            if (shouldSetVPre)
              return addVPre(pre)
          }
          return pre
        })
        // remove ! modifier from code tag
        .updateAll('code')((code) => {
          setAttribute('class')(
            getClassList(code).map(klass =>
              klass.startsWith('language-') ? klass.replace('!', '') : klass,
            ).join(' '),
          )(code)

          return code
        })
        .toContainer()

    return { ...payload, html }
  })

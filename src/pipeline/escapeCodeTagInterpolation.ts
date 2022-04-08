import { transformer } from '../utils'

const codeTagRe = /<code(?:.*?language-([!]{0,1})(\w+))?(.*?)>/g

/**
 * Modifies the HTML based on the configuration of `options.
 * escapeCodeTagInterpolation` and the fenced code blocks language
 * (if language starts `!` then options configuration is reversed).
 *
 * Because we are looking at the fenced language, we'll also add that to
 * the payload being passed through as this could be valuable for _search_
 * or other meta features.
 */
export const escapeCodeTagInterpolation = transformer('escapeCodeTagInterpolation', 'parsed', 'parsed', (payload) => {
  const { options: { escapeCodeTagInterpolation }, html, fencedLanguages } = payload
  const replacements = new Map()

  const match = html.matchAll(codeTagRe)

  // identify targets for interpolation in <code>, #14
  for (const m of match) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [codeTag, negation, lang] = m
    if (lang)
      fencedLanguages.add(lang)
    if (escapeCodeTagInterpolation) {
      if (negation !== '!')
        replacements.set(codeTag, codeTag.replace('>', ' v-pre>'))
      else
        replacements.set(codeTag, codeTag.replace(`!${lang}`, `${lang}`))
    }
    else {
      if (negation === '!')
        replacements.set(codeTag, codeTag.replace(`!${lang}`, `${lang}`).replace('>', ' v-pre>'))
    }
  }

  // iterate over interpolation replacements
  let updated: string = html

  for (const [before, after] of replacements)
    updated = updated.replace(new RegExp(before, 'g'), after)

  return { ...payload, html: updated, fencedLanguages }
})

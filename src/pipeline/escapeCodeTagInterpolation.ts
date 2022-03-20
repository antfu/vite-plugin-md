import type { Pipeline, PipelineStage } from '../@types'

/**
 * Modifies the HTML based on the configuration of `options.
 * escapeCodeTagInterpolation` and the fenced code blocks language 
 * (if language starts `!` then options configuration is reversed).
 *
 * Because we are looking at the fenced language, we'll also add that to 
 * the payload being passed through as this could be valuable for _search_ 
 * or other meta features.
 */
export function escapeCodeTagInterpolation(payload: Pipeline<PipelineStage.parsed>): Pipeline<PipelineStage.parsed> {
  const { options: { escapeCodeTagInterpolation }, html, fencedLanguages } = payload
  const replacements = new Map()

  // identify targets for interpolation in <code>, #14
  if (escapeCodeTagInterpolation) {
    const match = html.matchAll(/<code.*?language-([!]{0,1})(\w+).*?>/g)
    for (const m of match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [codeTag, negation, lang] = m
      fencedLanguages.add(lang)
      if (negation !== '!')
        replacements.set(codeTag, codeTag.replace('>', ' v-pre>'))
      else
        replacements.set(codeTag, codeTag.replace(`!${lang}`, `${lang}`))
    }
  }
  else {
    const match = html.matchAll(/<code.*?language-([!]{0,1})(\w+).*?>/g)
    for (const m of match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [codeTag, negation, lang] = m
      fencedLanguages.add(lang)
      if (negation === '!')
        replacements.set(codeTag, codeTag.replace(`!${lang}`, `${lang}`).replace('>', ' v-pre>'))
    }
  }

  // iterate over interpolation replacements
  let updated: string = html

  for (const [k, v] of replacements)
    updated = updated.replaceAll(k, v)

  return { ...payload, html: updated, fencedLanguages }
}

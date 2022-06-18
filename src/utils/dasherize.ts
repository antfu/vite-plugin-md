export function dasherize(input: string) {
  const [, preWhite, focus, postWhite] = /^(\s*)(.*?)(\s*)$/.exec(input) as RegExpExecArray

  const replaceWhitespace = (i: string) => i.replace(/\s/gs, '-')
  const replaceUppercase = (i: string) => i.replace(/[A-Z]/g, c => `-${c[0].toLowerCase()}`)
  const replaceLeadingDash = (i: string) => i.replace(/^-/s, '')
  const replaceTrailingDash = (i: string) => i.replace(/-$/s, '')
  const replaceUnderscore = (i: string) => i.replace(/_/g, '-')
  const removeDupDashes = (i: string) => i.replace(/-+/g, '-')

  return `${preWhite}${replaceUnderscore(
    replaceTrailingDash(
      replaceLeadingDash(removeDupDashes(replaceWhitespace(replaceUppercase(focus)))),
    ),
  )}${postWhite}`
}

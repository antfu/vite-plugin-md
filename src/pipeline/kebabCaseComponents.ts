import { dasherize, transformer } from '../utils'

/**
 * Because we use happy-dom to transform the pipeline, PascalCase components/blocks lose
 * their casing (since the HTML spec does not support uppercase tags); to avoid any issues with
 * VueJS components which the author wants to have transpiled as a component we will convert
 * these instance to kebab-case.
 *
 * While doing this we must avoid doing the same transformation when inside a code block.
 */
export const kebabCaseComponents = transformer('kebabCaseComponents', 'parsed', 'parsed', (p) => {
  const possiblePascalCase = /\<[A-Z]/s
  // we only need to scan and replace if there is suspicious character sequence
  if (possiblePascalCase.test(p.html)) {
    const pascalBlocks = /<([A-Z]\w*)/gs
    const blocks = p.html.matchAll(pascalBlocks)
    /** the set of PascalCase tag names in the HTML */
    const tagNames = new Set<string>()
    for (const b of blocks) {
      const [, tag] = b
      tagNames.add(tag)
    }

    Array.from(tagNames).forEach((tag) => {
      const open = new RegExp(`<${tag}`, 'gs')
      const close = new RegExp(`<\/${tag}>`, 'gs')
      p.html = p.html.replace(open, `<${dasherize(tag)}`).replace(close, `</${dasherize(tag)}>`)
    })
  }

  return { ...p }
})

import { ResolvedOptions } from './types'

const headProperties = [
  'title',
  'meta',
  'link',
  'base',
  'style',
  'script',
  'htmlAttrs',
  'bodyAttrs',
]

export function preprocessHead(frontmatter: any, options: ResolvedOptions) {
  if (!options.headEnabled)
    return frontmatter

  const head = options.headField ? frontmatter[options.headField] || {} : frontmatter

  const meta = head.meta = head.meta || []

  if (head.title) {
    if (!meta.find((i: any) => i.property === 'og:title'))
      meta.push({ property: 'og:title', content: head.title })
  }

  if (head.description) {
    if (!meta.find((i: any) => i.property === 'og:description'))
      meta.push({ property: 'og:description', content: head.description })

    if (!meta.find((i: any) => i.name === 'description'))
      meta.push({ name: 'description', content: head.description })
  }

  if (head.image) {
    if (!meta.find((i: any) => i.property === 'og:image'))
      meta.push({ property: 'og:image', content: head.image })

    if (!meta.find((i: any) => i.property === 'twitter:card'))
      meta.push({ name: 'twitter:card', content: 'summary_large_image' })
  }

  const result: any = {}

  for (const [key, value] of Object.entries(head)) {
    if (headProperties.includes(key))
      result[key] = value
  }

  return Object.entries(result).length === 0 ? null : result
}

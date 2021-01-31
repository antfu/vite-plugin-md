import { ResolvedOptions } from './types'

export function preprocessHead(frontmatter: any, options: ResolvedOptions) {
  if (!options.headEnabled)
    return frontmatter

  const head = options.headField ? frontmatter.head || {} : frontmatter

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

  return frontmatter
}

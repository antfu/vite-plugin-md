import { dirname, join } from 'node:path'
import { normalizePath } from 'vite'
import type Token from 'markdown-it/lib/token'
import type MarkdownIt from 'markdown-it'
import type { PluginSimple } from 'markdown-it'
import type { LinkElement } from '../../@types/core'
import type { LinkTransformer } from './link-types'

type NameValueTuple = [name: string, value: string]

export interface MdLinkOptions {
  /** The file which is being parsed */
  file: string
  /** the transform function which converts link attributes */
  transform: LinkTransformer
  /** the base URL for all internal links */
  base?: string
}

export type WithTagAndBase<T extends LinkElement> = T & {
  tagName?: string
  _base: string
}

/** converts the native attrs format to a dictionary style format */
function toDictionary(t: Token, base: string): WithTagAndBase<LinkElement> {
  const tagName = t.tag
  if (t.attrs === null)
    return { tagName, _base: base } as WithTagAndBase<LinkElement>

  return (t.attrs as NameValueTuple[]).reduce((acc, [k, v]) => {
    return { ...acc, [k]: v, tagName, _base: base }
  }, {}) as WithTagAndBase<LinkElement>
}

/**
 * Minimalist Markdown-IT plugin that receives all _link_ DOM attributes
 * and runs a transform function on it.
 */
const plugin = (o: MdLinkOptions): PluginSimple => (
  md: MarkdownIt,
) => {
  if (!o || !o.transform) {
    throw new Error('link plugin requires a transform function to do it\'s job!')
  }
  else {
    const base = normalizePath(join(o.base || '/', dirname(o.file)))
    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      const link = tokens[idx]
      const original = toDictionary(link, base)
      const transformed = o.transform(original)

      link.tag = transformed.tagName as string
      // remove `tagName` always as markdown-it doesn't see this as a link attribute
      delete transformed.tagName

      for (const [k, v] of Object.entries(transformed)) {
        const attrIndex = link.attrIndex(k)
        if (attrIndex < 0 && v !== undefined) {
          // this attr did not previously exist before the transform
          link.attrPush([k, v as string])
        }
        else if (attrIndex >= 0) {
          if (v !== undefined && !k.startsWith('_')) {
            // the attr had existed, and transformed value exists
            link.attrSet(k, v as string)
          }
          else {
            link.attrs = link.attrs?.filter(i => i[0] !== k) as [string, string][]
          }
        }
      }

      return self.renderToken(tokens, idx, options)
    }

    md.renderer.rules.link_close = function(tokens, idx, options, _env, self) {
      const close = tokens[idx]
      const priors = tokens.slice(0, idx).reverse()
      let open: Token | undefined
      let openIdx = -1
      priors.forEach((t, idx) => {
        if (t.type === 'link_open' && !open) {
          open = t
          openIdx = idx
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const between = priors.slice(0, openIdx + 1).reverse()
      close.tag = open ? open.tag : 'a'

      return self.renderToken(tokens, idx, options)
    }
  }
}

export default plugin

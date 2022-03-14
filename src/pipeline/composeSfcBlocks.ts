import { resolveOptions } from '../options'
import type { Options, ResolvedOptions, SfcBlocks, ViteConfigPassthrough, WithConfig } from '../types'
import { wrap } from '../utils'
import { extractBlocks, extractMeta } from './index'

/**
 * Composes the `template` and `script` blocks, along with any other `customBlocks` from the raw
 * markdown content along with user options.
 */
export function composeSfcBlocks(id: string, raw: string, options: Options = {}, config: Partial<ViteConfigPassthrough> = {}): SfcBlocks {
  const c: ViteConfigPassthrough = {
    base: '/',
    mode: 'production',
    ...config,
  }
  const o: WithConfig<ResolvedOptions> = { ...resolveOptions(options), ...c }
  const { transforms } = o

  // Processing Pipeline
  raw = raw.trimStart()
  if (transforms.before)
    raw = transforms.before(raw, id)
  const meta = extractMeta(raw, id, o)
  const { html, script, customBlocks } = extractBlocks(meta, o)
  return {
    // good for testing
    html,
    meta,
    script,
    customBlocks,
    // used for core functionality
    component: transforms.after
      ? transforms.after(`${wrap('template', html)}\n${script}\n${customBlocks.join('\n')}`, id)
      : `${wrap('template', html)}\n${script}\n${customBlocks.join('\n')}`,
  }
}

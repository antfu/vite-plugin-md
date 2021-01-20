import { Options, ResolvedOptions } from './types'
import { toArray } from './utils'

export function resolveOptions(userOptions: Options): ResolvedOptions {
  const options = Object.assign({
    headEnabled: false,
    headField: '',
    markdownItOptions: {},
    markdownItUses: [],
    markdownItSetup: () => {},
    wrapperClasses: 'markdown-body',
    wrapperComponent: null,
    transforms: {},
  }, userOptions) as ResolvedOptions

  options.wrapperClasses = toArray(options.wrapperClasses).filter(i => i).join(' ')

  return options
}

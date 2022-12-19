import { transformer } from '../utils'

export const prepHeadProps = <B extends readonly any[]>() => transformer<B>()(
  'metaExtracted',
  p => ({
    ...p,
  }),
)
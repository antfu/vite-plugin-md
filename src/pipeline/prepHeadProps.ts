import type { GenericBuilder } from '../types'
import { transformer } from '../utils'

export const prepHeadProps = <B extends readonly GenericBuilder[]>() => transformer<B>()(
  'metaExtracted',
  p => ({
    ...p,
  }),
)
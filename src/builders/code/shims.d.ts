/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PrismLanguage } from './types/prism-language'

declare module 'prismjs' {
  const Prism = {
    highlight(code: string, lang: any, langName: PrismLanguage) {
      //
    },
    manual: true as boolean,
    [key as string]: any,
  }
  export default Prism
}

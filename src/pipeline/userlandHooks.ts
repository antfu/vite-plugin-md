import { transformer } from '../utils/fp'

/**
 * Allows users who opt-into the option `getFinalizedReport` option to receive
 * an update o the finalized state of a given file.
 */
export const getFinalizedReportHook = <B extends readonly any[]>() => transformer<B>()(
  'closeout',
  (p) => {
    if (p.options?.getFinalizedReport)
      p.options.getFinalizedReport(p)

    return p
  })

/**
 * Allows users who opt-into the option `mutateParsed` to mutate pipeline state
 */
export const mutateParsed = <B extends readonly any[]>() => transformer<B>()(
  'parsed',
  (p) => {
    return p.options?.mutateParsed ? p.options.mutateParsed(p) : p
  })

/**
 * Allows users who opt-into the option `mutateSfcBlocks` to mutate pipeline state
 */
export const mutateSfcBlocks = <B extends readonly any[]>() => transformer<B>()(
  'sfcBlocksExtracted',
  (p) => {
    return p.options?.mutateSfcBlocks ? p.options.mutateSfcBlocks(p) : p
  })
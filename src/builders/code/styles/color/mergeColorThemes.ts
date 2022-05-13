import type { CodeColorTheme, ColorByMode } from './color-types'

export function left(item: string | ColorByMode) {
  return Array.isArray(item) ? item[0] : item
}
export function right(item: string | ColorByMode) {
  return Array.isArray(item) ? item[1] : item
}

/**
 * Utility that merges two themes together to produce a light/dark mode theme
 */
export const mergeColorThemes = <T1 extends CodeColorTheme<any>, T2 extends CodeColorTheme<any>>(light: T1, dark: T2): CodeColorTheme<ColorByMode> => {
  const props = Array.from(new Set([...Object.keys(light), ...Object.keys(dark)]))
  return props.reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: [
        left(light[prop as keyof CodeColorTheme<any>]),
        right(dark[prop as keyof CodeColorTheme<any>]),
      ] as ColorByMode,
    }),
    {} as CodeColorTheme<ColorByMode>,
  )
}


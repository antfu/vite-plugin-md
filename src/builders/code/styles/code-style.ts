import type { UserConfig } from 'unocss'
import { defineConfig, presetIcons, presetTypography, presetWind, transformerDirectives, transformerVariantGroup } from 'unocss'
export type UnoConfig = ReturnType<typeof defineConfig>

// import { heading } from './heading'

// export default (): UnoConfig => defineConfig({
//   rules: [
//     [
//       /^code-block$/,
//       () => {
//         display: 'flex'
//       }, {}],
//   ],

// })

export const stylish = (_user: UserConfig): UnoConfig => defineConfig<any>({
  shortcuts: [
    ['code-wrapper', 'p-1'],
  ],
  presets: [
    presetWind(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})


import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'btn',
      'px-4 py-2 rounded border-0 inline-block text-white cursor-pointer bg-teal-600 dark:bg-teal-500 hover:(bg-teal-700 dark:bg-teal-600) disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    ],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
    [
      /^tag(-red|-blue|-green|-yellow){0,1}(-[0-9]00){0,1}(\:.*){0,1}$/,
      ([b, c, i, _v]) => `bg${c || '-gray'}${i || '-500'} py-${b.includes(':lg') ? 1 : 0.5} px-${b.includes(':lg') ? 2.5 : 1.5} rounded-lg cursor-pointer mx-0.5 text-${i ? Number(i.slice(1)) < 500 ? 'black' : 'white' : 'white'}`,
    ],
  ],
  rules: [
    ['happy', { color: 'green' }],
  ],
  variants: [
    matcher => !matcher.startsWith('lg:')
      ? matcher
      : {
          matcher: matcher.slice(3),
          selector: s => `${s}:lg`,
        },
  ],
  presets: [
    presetWind(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: 'prose prose-sm m-auto text-left'.split(' '),
})

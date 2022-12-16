import type { Equal, Expect } from '@type-challenges/utils'
import { describe, it } from 'vitest'
import meta from '@yankeeinlondon/meta-builder'
import type { ConfiguredBuilder } from '@yankeeinlondon/builder-api'
import { createBuilder } from '@yankeeinlondon/builder-api'
import type { GenericBuilder, Options, PipeTask, Pipeline, PipelineStage, ResolvedOptions } from '../src'
import { resolveOptions } from '../src/options'
import { lift } from '../src/utils'

// Note: while type tests clearly fail visible inspection, they pass from Vitest
// standpoint so always be sure to run `tsc --noEmit` over your test files to
// gain validation that no new type vulnerabilities have cropped up.

const createOption = <B extends readonly GenericBuilder[]>(o: Options<B>) => o
const createPayload = <S extends PipelineStage, B extends readonly GenericBuilder[]>(p: Pipeline<S, B>) => p

const testBuilder = createBuilder('test', 'parsed')
  .options<{ name: string }>()
  .initializer()
  .handler((p, o) => p)
  .meta({ description: 'this is a test' })

describe('option resolution', () => {
  it('BuilderApi converts to ConfiguredBuilder', () => {
    const b = testBuilder()
    const b2 = testBuilder({ name: 'Bob' })

    type cases = [
      Expect<Equal<
        typeof b,
        ConfiguredBuilder<'test', { name: string }, 'parsed', 'this is a test'>
      >>,
      Expect<Equal<
        typeof b2,
        ConfiguredBuilder<'test', { name: string }, 'parsed', 'this is a test'>
      >>,
    ]
  })

  it('Options resolve builders generic', () => {
    const empty = createOption({})
    const noBuilders = createOption({ builders: [] })
    const withBuilders = createOption({ builders: [testBuilder()] })
    const withBuildersConfigured = createOption({ builders: [testBuilder({ name: 'Bob' })] })

    type cases = [
      Expect<Equal<typeof empty, Options<readonly GenericBuilder[]>>>,
      Expect<Equal<typeof noBuilders, Options<never[]>>>,
      // TODO: fix builders and then test
      Expect<Equal<typeof withBuilders, never>>,
      Expect<Equal<typeof withBuildersConfigured, never>>,
    ]
  })

  it('ResolvedOptions', () => {
    const empty = resolveOptions(createOption({}))
    const noBuilders = resolveOptions(createOption({ builders: [] }))
    const withBuilders = resolveOptions(createOption({ builders: [meta()] }))
    const withBuildersConfigured = resolveOptions(createOption({ builders: [meta({})] }))

    type cases = [
      Expect<Equal<typeof empty, ResolvedOptions<readonly GenericBuilder[]>>>,
      Expect<Equal<typeof noBuilders, ResolvedOptions<never[]>>>,
    ]
    const cases: cases = [true, true]
  })

  it('lift() utility converts a pipeline to a PipeTask', () => {
    const empty = resolveOptions(createOption({}))
    const payload = createPayload({
      stage: 'initialize',
      fileName: 'foobar.md',
      content: 'I thought I saw a puddy tat',
      head: {},
      frontmatter: undefined,
      routeMeta: undefined,
      viteConfig: {},
      vueStyleBlocks: {},
      vueCodeBlocks: {},
      codeBlockLanguages: {
        langsRequested: [],
        langsUsed: [],
      },
      options: empty,
    })
    const lifted = lift(payload)

    type B = typeof payload['options']['builders']

    type cases = [
      Expect<Equal<typeof payload, Pipeline<'initialize', B>>>,
      Expect<Equal<typeof lifted, PipeTask<'initialize', B>>>,
    ]
    const cases: cases = [true, true]
  })
})
import type { Equal, Expect } from '@type-challenges/utils'
import { describe, expect, it } from 'vitest'
import type { ConfiguredBuilder } from '@yankeeinlondon/builder-api'
import { createBuilder } from '@yankeeinlondon/builder-api'
import type { GenericBuilder, Options, PipeTask, Pipeline, PipelineStage, ResolvedOptions, ToBuilder } from '../src'
import { resolveOptions } from '../src/options'
import { lift } from '../src/utils'

// Note: while type tests clearly fail visible inspection, they pass from Vitest
// standpoint so always be sure to run `tsc --noEmit` over your test files to
// gain validation that no new type vulnerabilities have cropped up.

const createOption = <
  O extends Options<(readonly any[]) | 'none'> = Options<'none'>,
>(o?: O) => {
  return (
    o
      ? o.builders
        ? o.builders
        : []
      : o
  ) as Options<ToBuilder<O['builders']>>
}

const createPayload = <S extends PipelineStage, B extends readonly GenericBuilder[]>(p: Pipeline<S, B>) => p

const testBuilder = createBuilder('test', 'parsed')
  .options<{ name: string }>()
  .initializer()
  .handler(async (p, _o) => p)
  .meta({ description: 'this is a test' })

const t2 = createBuilder('t2', 'metaExtracted')
  .options<{}>()
  .initializer()
  .handler(async p => p)
  .meta()

describe('option resolution', () => {
  it('BuilderApi converts to ConfiguredBuilder', () => {
    const b = testBuilder()
    const b2 = testBuilder({ name: 'Bob' })

    type B0 = ToBuilder<readonly [typeof b]>
    type B1 = ToBuilder<[]>
    type B2 = ToBuilder<'none'>

    // kind
    expect(testBuilder.kind).toBe('builder')
    expect(b.kind).toBe('builder')
    // name
    expect(testBuilder.about.name).toBe('test')
    expect(b.about.name).toBe('test')

    type Configured = ConfiguredBuilder<'test', { name: string }, 'parsed', 'this is a test'>

    type cases = [
      Expect<Equal<typeof b, Configured>>,
      Expect<Equal<typeof b2, Configured>>,
      Expect<Equal<B0, readonly [Configured]>>,
      Expect<Equal<B1, readonly []>>,
      Expect<Equal<B2, readonly []>>,
    ]
  })

  it('Options resolve builders generic', () => {
    const empty = createOption()
    const noBuilders = createOption({ builders: [] })
    const withBuilders = createOption({ builders: [testBuilder()] })
    const withMultipleBuilders = createOption({ builders: [testBuilder(), t2()] })
    const withBuildersConfigured = createOption({ builders: [testBuilder({ name: 'Bob' })] })

    type TestBuilder = ReturnType<typeof testBuilder>
    type TestBuilder2 = ConfiguredBuilder<'test', { name: string }, 'parsed', 'this is a test'>
    type T2 = ReturnType<typeof t2>

    type cases = [
      Expect<Equal<TestBuilder, TestBuilder2>>,
      Expect<Equal<typeof empty, Options<readonly []>>>,
      Expect<Equal<typeof noBuilders, Options<readonly []>>>,
      Expect<Equal<typeof withBuilders, Options<readonly [TestBuilder2]>>>,
      Expect<Equal<typeof withMultipleBuilders, Options<readonly [TestBuilder, T2]>>>,
      Expect<Equal<typeof withBuildersConfigured, Options<readonly [TestBuilder2]>>>,
    ]
  })

  it('ResolvedOptions', () => {
    const empty = resolveOptions(createOption())
    const noBuilders = resolveOptions(createOption({ builders: [] }))
    const withBuilders = resolveOptions(createOption({ builders: [testBuilder()] }))
    const withBuildersConfigured = resolveOptions(createOption({ builders: [testBuilder({ name: 'Bob' })] }))
    const withMultipleBuilders = resolveOptions(createOption({ builders: [testBuilder(), t2()] }))

    type TestBuilder = ReturnType<typeof testBuilder>
    type T2 = ReturnType<typeof t2>

    type cases = [
      Expect<Equal<typeof empty, ResolvedOptions<readonly []>>>,
      Expect<Equal<typeof noBuilders, ResolvedOptions<readonly []>>>,
      Expect<Equal<typeof withBuilders, ResolvedOptions<readonly [TestBuilder]>>>,
      Expect<Equal<typeof withBuildersConfigured, ResolvedOptions<readonly [TestBuilder]>>>,
      Expect<Equal<typeof withMultipleBuilders, ResolvedOptions<readonly [TestBuilder, T2]>>>,
    ]
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
  })
})
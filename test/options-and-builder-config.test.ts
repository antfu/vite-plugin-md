import type { Equal, Expect } from '@type-challenges/utils'
import { describe, expect, it } from 'vitest'
import type { ConfiguredBuilder } from '@yankeeinlondon/builder-api'
import { createBuilder } from '@yankeeinlondon/builder-api'
// import meta from '@yankeeinlondon/meta-builder'
import type { Narrowable, NarrowlyContains } from 'inferred-types'
import meta from '@yankeeinlondon/meta-builder'
import type { BuilderFrom, Options, PipeTask, Pipeline, PipelineStage, ResolvedOptions, ToBuilder } from '../src'
import { resolveOptions } from '../src/pipeline/resolveOptions'
import { lift } from '../src/utils'
import type { AddBuilder, FilterNamedConfig, FilterTuple, GetEach, NamedBuilders } from '../src/types/type-utils'

// Note: while type tests clearly fail visible inspection, they pass from Vitest
// standpoint so always be sure to run `tsc --noEmit` over your test files to
// gain validation that no new type vulnerabilities have cropped up.

const createPartialOption = <
  O extends Partial<Options<readonly any[] | readonly []>> = Partial<Options<readonly []>>,
>(o?: O) => {
  return (
    o
      ? o.builders
        ? o.builders
        : []
      : o
  ) as O['builders'] extends undefined
    ? Partial<Options<readonly []>>
    : Partial<Options<ToBuilder<O['builders']>>>
}

const createPayload = <
  TStage extends PipelineStage,
  B extends readonly any[],
>(p: Pipeline<TStage, B>) => p

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

const fakeMeta = createBuilder('meta', 'dom')
  .options<{}>()
  .initializer()
  .handler(async p => p)
  .meta({ description: 'this is kinda fake' })

describe('option resolution', () => {
  it('GetEach', () => {
    const o1 = createPartialOption({ builders: [t2()] })
    const o2 = createPartialOption({ builders: [t2(), fakeMeta()] })

    type O1 = BuilderFrom<typeof o1>
    type O2 = BuilderFrom<typeof o2>

    type T1 = NarrowlyContains<'t2', GetEach<O1, 'about.name'>> // true
    type T2 = NarrowlyContains<'t3', GetEach<O1, 'about.name'>> // false
    type T3 = NamedBuilders<O2>

  type cases = [
    Expect<Equal<T1, true>>, //
    Expect<Equal<T2, false>>,
    Expect<Equal<T3, readonly ['t2', 'meta']>>,
  ]
  })

  it('ToBuilder and BuilderFrom type utils', () => {
    // partial options
    const po1 = createPartialOption()
    const po1b = createPartialOption({})
    const po1c = createPartialOption({ builders: [] })
    type PO1 = BuilderFrom<typeof po1>
    type PO1b = BuilderFrom<typeof po1b>
    type PO1c = BuilderFrom<typeof po1c>
    const po2 = createPartialOption({ builders: [testBuilder()] })
    type PO2 = BuilderFrom<typeof po2>
    const po3 = createPartialOption({ builders: [testBuilder(), t2()] })
    type PO3 = BuilderFrom<typeof po3>

    type TestBuilder = ReturnType<typeof testBuilder>
    type T2 = ReturnType<typeof t2>

    type cases = [
      Expect<Equal<PO1, readonly [] >>, //
      Expect<Equal<PO1b, readonly []>>, //
      Expect<Equal<PO1c, readonly []>>, //
      Expect<Equal<PO2, readonly [TestBuilder]>>,
      Expect<Equal<PO3, readonly [TestBuilder, T2] >>,
    ]
  })

  it('BuilderApi converts to ConfiguredBuilder', () => {
    const b = testBuilder()
    const b2 = testBuilder({ name: 'Bob' })

    type B0 = ToBuilder<readonly [typeof b]>
    type B1 = ToBuilder<[]>
    type B2 = ToBuilder<undefined>

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
    const empty = createPartialOption()
    const noBuilders = createPartialOption({ builders: [] })
    const withBuilders = createPartialOption({ builders: [testBuilder()] })
    const withMultipleBuilders = createPartialOption({ builders: [testBuilder(), t2()] })
    const withBuildersConfigured = createPartialOption({ builders: [testBuilder({ name: 'Bob' })] })

    type TestBuilder = ReturnType<typeof testBuilder>
    type TestBuilder2 = ConfiguredBuilder<'test', { name: string }, 'parsed', 'this is a test'>
    type T2 = ReturnType<typeof t2>

    type cases = [
      Expect<Equal<TestBuilder, TestBuilder2>>,
      Expect<Equal<typeof empty, Partial<Options<readonly []>>>>,
      Expect<Equal<typeof noBuilders, Partial<Options<readonly []>>>>,
      Expect<Equal<typeof withBuilders, Partial<Options<readonly [TestBuilder2]>>>>,
      Expect<Equal<typeof withMultipleBuilders, Partial<Options<readonly [TestBuilder, T2]>>>>,
      Expect<Equal<typeof withBuildersConfigured, Partial<Options<readonly [TestBuilder2]>>>>,
    ]
  })

  it('ResolvedOptions', () => {
    const empty = resolveOptions(createPartialOption())
    const noBuilders = resolveOptions(createPartialOption({ builders: [] }))
    const withBuilders = resolveOptions(createPartialOption({ builders: [testBuilder()] }))
    const withBuildersConfigured = resolveOptions(createPartialOption({ builders: [testBuilder({ name: 'Bob' })] }))
    const withMultipleBuilders = resolveOptions(createPartialOption({ builders: [testBuilder(), t2()] }))
    const withFakeMeta = resolveOptions(createPartialOption({
      builders: [testBuilder(), fakeMeta()],
    }))
    const realMeta = meta()

    type Empty = BuilderFrom<typeof empty>
    type WithBuilders = BuilderFrom<typeof withBuilders>
    type MultiBuilders = BuilderFrom<typeof withMultipleBuilders>
    type FakeMeta = BuilderFrom<typeof withFakeMeta>
    type Removed = FilterNamedConfig<'meta', FakeMeta>
    // type RemovedNothing = FilterNamedConfig<'meta', WithBuilders>
    type Added = AddBuilder<typeof realMeta, Removed>
    type Named = NamedBuilders<Added>

    type cases = [
      Expect<Equal<typeof empty, ResolvedOptions<Empty>>>,
      Expect<Equal<typeof noBuilders, ResolvedOptions<Empty>>>,
      Expect<Equal<typeof withBuilders, ResolvedOptions<WithBuilders>>>,
      Expect<Equal<typeof withBuildersConfigured, ResolvedOptions<WithBuilders>>>,
      Expect<Equal<typeof withMultipleBuilders, ResolvedOptions<MultiBuilders>>>,
      Expect<Equal<typeof withFakeMeta, ResolvedOptions<FakeMeta>>>,
      Expect<Equal<Named, readonly ['test', 'meta']>>,
    ]
  })

  it('lift() utility converts a pipeline to a PipeTask', () => {
    const empty = resolveOptions(createPartialOption({}))
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

    type B = BuilderFrom<typeof empty>

    type cases = [
      Expect<Equal<typeof payload, Pipeline<'initialize', B>>>,
      Expect<Equal<typeof lifted, PipeTask<'initialize', B>>>,
    ]
  })
})
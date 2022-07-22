/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import type { Equal, Expect, ExpectExtends } from '@type-challenges/utils'
import type { BuilderApi, BuilderReadyForInitializer, BuilderReadyForOptions } from '../src'
import { PipelineStage, createBuilder } from '../src'

interface MyBuilderOptions {
  quantity: number
  color: string
}

describe('Builder API registration', () => {
  it('using createBuilder provides the correct types at each stage', async () => {
    const a = createBuilder('tst', PipelineStage.parsed)
    const b = a.options<MyBuilderOptions>()
    const c = b.initializer()
    const d = c
      .handler((p, o) => {
        console.log('options are:', o)
        console.log('payload is: ', p)

        return Promise.resolve(p)
      })
    const complete = d.meta()

    type Expected = BuilderApi<MyBuilderOptions, PipelineStage.parsed>
    type ExpectedWithValue = BuilderApi<MyBuilderOptions, 'parsed'>
    type ExpArg = Parameters<Expected>[0]

    type Cases = [
      // Step A
      Expect<Equal<BuilderReadyForOptions<PipelineStage.parsed>, typeof a>>,
      // Step B
      Expect<Equal<BuilderReadyForInitializer<MyBuilderOptions, PipelineStage.parsed>, typeof b>>,
      // Step C
      // Expect<Equal<BuilderReadyForHandler<MyBuilderOptions, PipelineStage.parsed>, typeof c>>,
      // Step D
      // Expect<Equal<BuilderReadyForMeta<MyBuilderOptions, PipelineStage.parsed>, typeof d>>,

      // literal type is correct
      Expect<Equal<Expected, typeof complete>>,
      ExpectExtends<ExpectedWithValue, typeof complete>,
      // the function argument is correct
      Expect<Equal<ExpArg, Partial<MyBuilderOptions> | undefined>>,
    ]
    const cases: Cases = [true, true, true, true, true]
    expect(cases).toBe(cases)
  })

  it('using createBuilder provides an "about" hash with correct values', () => {
    const builder = createBuilder('foo', 'parsed')
      .options<{ color: string }>()
      .initializer()
      .handler(p => Promise.resolve(p))
      .meta({
        description: 'this is a test',
      })

    expect(builder.about).toBeDefined()
    expect(builder.about.description).toBe('this is a test')
  })
})

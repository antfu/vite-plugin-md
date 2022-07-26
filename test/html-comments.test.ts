import { describe, expect, it } from 'vitest'
import { composeFixture } from './utils'

describe('HTML Comments', () => {
  it('sequence of preamble, comment, and ensemble text is correct', async () => {
    const { component } = await composeFixture('with-html-comment')

    const since = component.indexOf('Since Markdown is a superset of HTML then it follows')
    const comment = component.indexOf('<!--  this is a comment, please ignore me  -->')
    const shouldBe = component.indexOf('should be allowed in the Markdown.')

    expect(since < shouldBe).toBeTruthy()
    expect(comment > since).toBeTruthy()
    expect(comment < shouldBe).toBeTruthy()
  })
})

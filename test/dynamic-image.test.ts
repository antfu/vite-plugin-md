import { describe, expect, it } from 'vitest'
import {  composeFixture } from './utils'

describe('loading images from frontmatter props', () => {
  it('snapshot test', async() => {
    const md = await composeFixture('get-the-picture')

    expect(md).toMatchSnapshot()
  })
})

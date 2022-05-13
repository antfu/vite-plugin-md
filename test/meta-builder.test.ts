import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'
import { select, toHtml } from 'happy-wrapper'
import { resolveOptions } from '../src/options'
import { meta } from '../src/index'
import type { Options } from '../src/types'
import { composeSfcBlocks } from '../src/pipeline'
import { composeFixture } from './utils'

let md = ''

describe('use "meta" builder for frontmatterPreprocess', async () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('with no config, doc props all available as frontmatter props and other meta props get default mapping', async () => {
    const sfc = await composeSfcBlocks('', md, { builders: [meta()] })

    expect(sfc.frontmatter.title).toEqual('Metadata Rules')
    expect(sfc.frontmatter.byline).toEqual('who loves ya baby?')
    expect(sfc.frontmatter.layout).toEqual('yowza')
    expect(sfc.frontmatter.image).toEqual('facebook.png')

    expect(sfc.head.title).toEqual('Metadata Rules')
    expect(sfc.routeMeta?.meta?.layout).toEqual('yowza')
    expect(sfc.meta.find(p => p.key === 'title')).toBeDefined()
    expect(sfc.meta.find(p => p.key === 'image')).toBeDefined()
  })

  it('default value is used when no frontmatter is present', async () => {
    const options: Options = {
      builders: [
        meta({
          defaults: {
            title: 'nada',
            description: 'there I was, there I was',
          },
        }),
      ],
    }
    const sfc = await composeSfcBlocks('', md, resolveOptions(options))

    expect(
      sfc.frontmatter.title,
      'default value should have been ignored in favor of page value',
    ).toBe('Metadata Rules')

    expect(
      sfc.frontmatter.description,
      `default value should have presented, found: ${sfc.frontmatter}`,
    ).toBe('there I was, there I was')

    expect(
      sfc.meta.find(i => i.key === 'description'),
      'description, as a default value, should now be in meta props',
    ).toBeDefined()
  })

  it('frontmatter props exported', async () => {
    const output = (await composeSfcBlocks('', md)).component

    expect(output.includes('const title')).toBeTruthy()
    expect(output.includes('const byline')).toBeTruthy()
    expect(output.includes('const layout')).toBeTruthy()
    expect(output.includes('const image')).toBeTruthy()

    expect(output.includes('const frontmatter')).toBeTruthy()
    expect(output.includes('export const frontmatter')).toBeTruthy()
    expect(output.includes('defineExpose({ ')).toBeTruthy()
  })

  it('default route prop "layout" converted to route meta when present', async () => {
    const sfc = await composeFixture('meta', {
      builders: [meta()],
    })

    const route = sfc.customBlocks.find(i => i.includes('<route'))
    expect(route).toBeDefined()
    expect(route).toContain('layout')
  })

  it('configuring a property to be a route meta property results in a Route custom block being created for a given page', async () => {
    const sfc = await composeFixture('route-meta-custom', {
      builders: [meta({ routeProps: ['requiresAuth', 'layout'] })],
    })

    const routes = sfc.customBlocks.filter(i => i.includes('<route'))
    expect(routes).toHaveLength(1)
    expect(routes[0], `custom block was: ${sfc.customBlocks[0]}`).toContain('layout')
    expect(routes[0]).toContain('requiresAuth')
  })

  it('setting static and callback based default values works', async () => {
    const sfc = await composeFixture('route-meta-custom', {
      builders: [meta({
        defaults: {
          foo: 'bar',
          title: 'default title',
          requiresAuth: (_, file) => !!file.includes('secure'),
        },
      })],
    })

    expect(sfc.frontmatter.foo).toBe('bar') // no page value
    expect(sfc.frontmatter.title).toBe('Metadata for your Route') // overridden
    expect(sfc.frontmatter.requiresAuth).toBe(true) // overridden

    const sfc2 = await composeFixture('meta', {
      builders: [meta({
        defaults: {
          requiresAuth: (_, file) => !!file.includes('secure'),
        },
      })],
    })
    expect(sfc2.frontmatter.requiresAuth).toBe(false) // callback used

    const sfc3 = await composeFixture('secure', {
      builders: [meta({
        defaults: {
          requiresAuth: (_, file) => !!file.includes('secure'),
        },
      })],
    })
    expect(sfc3.frontmatter.requiresAuth).toBe(true) // callback used
  })

  it('override callback has ability to modify frontmatter to it\'s liking', async () => {
    const sfc4 = await composeFixture('secure', {
      builders: [meta({
        defaults: {
          requiresAuth: (_, file) => !!file.includes('secure'),
        },
        override: (fm, file) => ({ ...fm, category: file.includes('secure') ? 'top-secret' : 'pedestrian' }),
      })],
    })
    expect(sfc4.frontmatter.category).toBe('top-secret')
  })
})

describe('meta() can manage route meta', () => {
  it('manually entering a route in markdown content is picked up and used', async () => {
    const sfc = await composeFixture('meta', { builders: [meta()] })

    expect(sfc.frontmatter.layout).toBe('yowza')
    // custom blocks were created
    expect(sfc.customBlocks.length).toBeGreaterThan(0)
    expect(sfc.component).toContain('<route')
    // isolate route config
    const routes = select(sfc.component).findAll('route')
    expect(routes).toHaveLength(1)
    expect(routes[0].textContent).toContain('"layout":"yowza"')
  })

  it('setting "layout" adds a custom block for a route', async () => {
    const sfc = await composeFixture('meta-manual', { builders: [meta()] })

    expect(sfc.frontmatter.layout).not.toBe('yowza')
    // custom blocks were created
    expect(sfc.customBlocks.length).toBeGreaterThan(0)
    expect(sfc.component).toContain('<route')
    // isolate route config
    const routes = select(sfc.component).findAll('route')
    expect(routes).toHaveLength(1)
    // TODO: this is bizarre, the quotes are being translated from
    // normal quotes to fancy quotes when manually put into page
    // maybe this is ok but it was surprising
    expect(
      toHtml(routes[0]),
      toHtml(routes[0]),
    ).toContain('“yowza”')
  })

  it('configuring a name callback allows us to give a name to our routes', async () => {
    const sfc = await composeFixture('meta', {
      builders: [meta({
        routeName: (filename, fm) => fm.name ? fm.name : `bespoke-${filename}`,
      })],
    })

    expect(sfc.frontmatter.name).toBe('My Name')
    // isolate route config
    const routes = select(sfc.component).findAll('route')
    expect(routes).toHaveLength(1)
    expect(routes[0].textContent).toContain('"name":"My Name"')
  })
})

describe('meta() snapshots', async () => {
  beforeAll(async () => {
    md = await readFile('test/fixtures/meta.md', 'utf-8')
  })

  it('frontmatter is consistent', async () => {
    const { frontmatter } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(frontmatter).toMatchSnapshot()
  })

  it('HTML is consistent', async () => {
    const { html } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(html).toMatchSnapshot()
  })

  it('script blocks are consistent', async () => {
    const { scriptBlock } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(scriptBlock).toMatchSnapshot()
  })

  it('custom blocks are consistent', async () => {
    const { customBlocks } = await composeSfcBlocks('/foobar/meta.md', md)
    expect(customBlocks).toMatchSnapshot()
  })
})

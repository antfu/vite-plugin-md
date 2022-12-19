import type { MaybeRef } from '@vueuse/core'
import type { IElement } from '@yankeeinlondon/happy-wrapper'
import { createElement, isElement } from '@yankeeinlondon/happy-wrapper'
import { isRef, ref } from 'vue'
import type { LinkProperty, MetaProperty, Pipeline, PipelineStage, PipelineUtilityFunctions, ScriptProperty, StyleProperty } from '../types'

const add = (p: MaybeRef<any[]>, v: any) => isRef(p) ? p.value.push(v) : p.push(v)
const set = (p: MaybeRef<any>, v: any) => isRef(p) ? p.value = v : p = v
const get = (p: MaybeRef<any>) => isRef(p) ? p.value : p

const convertToDictionary = (link: IElement): Record<string, any> => {
  const attrs = Object.keys(link.attributes)
  return attrs.reduce(
    (acc, prop) => ({ ...acc, [prop]: link.getAttribute(prop) }),
    {},
  )
}

export const pipelineUtilityFunctions = <
  P extends Pipeline<PipelineStage, readonly any[]>,
>(
    ctx: P,
  ): PipelineUtilityFunctions => ({
    setTitle(title) {
      if (!ctx.head.title)
        ctx.head.title = ref('')

      set(ctx.head.title, title)
    },

    setCharset(type) {
      if (!ctx.head.charset)
        ctx.head.charset = ref('')

      set(ctx.head.charset, `<meta charset="${type}">`)
    },

    addLink(link) {
      if (!ctx.head.link)
        ctx.head.link = ref([] as LinkProperty[])

      add(ctx.head.link, link)
    },
    /** add a <script> block which references a URL as a source */
    addScriptReference(script) {
      if (!ctx.head.script)
        ctx.head.script = ref([] as ScriptProperty[])

      add(ctx.head.script, isElement(script) ? convertToDictionary(script) : script)
    },

    /** add inline code to a script block on the page */
    addCodeBlock(name, script, forVue2) {
      ctx.vueCodeBlocks[name] = forVue2 ? [script, forVue2] : script
    },

    addMetaProperty(meta) {
      if (!ctx.head.meta)
        ctx.head.meta = ref([] as MetaProperty[])

      add(ctx.head.meta, meta)
    },

    getMetaProperties() {
      return (get(ctx.head.meta) || []) as MetaProperty[]
    },

    setMetaProperties(meta: MetaProperty[]) {
      set(ctx.head.meta, meta)
    },

    findMetaProperty(name: string) {
      return pipelineUtilityFunctions(ctx).getMetaProperties().find(i => i.name === name)
    },

    addStyleBlock(name, style) {
      ctx.vueStyleBlocks[name] = typeof style === 'string'
        ? createElement(style)
        : style
    },

    addStyleReference(style) {
      if (!ctx.head.style)
        ctx.head.style = ref([] as StyleProperty[])

      add(ctx.head.style, style)
    },
  })

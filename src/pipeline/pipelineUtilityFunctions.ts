import type { MaybeRef } from '@vueuse/core'
import type { IElement } from 'happy-wrapper'
import { createElement, isElement } from 'happy-wrapper'
import { isRef, ref } from 'vue'
import type { LinkProperty, Pipeline, PipelineStage, PipelineUtilityFunctions, ScriptProperty, StyleProperty } from '../types'

const add = (p: MaybeRef<any[]>, v: any) => isRef(p) ? p.value.push(v) : p.push(v)

const convertToDictionary = (link: IElement): Record<string, any> => {
  const attrs = Object.keys(link.attributes)
  return attrs.reduce(
    (acc, prop) => ({ ...acc, [prop]: link.getAttribute(prop) }),
    {},
  )
}

export const pipelineUtilityFunctions = (
  ctx: Pipeline<PipelineStage.metaExtracted>,
): PipelineUtilityFunctions => ({
  addLink(link) {
    if (!ctx.head.link)
      ctx.head.link = ref([] as LinkProperty[])

    add(ctx.head.link, link)
  },
  addScriptReference(script) {
    if (!ctx.head.script)
      ctx.head.script = ref([] as ScriptProperty[])

    add(ctx.head.script, isElement(script) ? convertToDictionary(script) : script)
  },

  addCodeBlock(name, script, forVue2) {
    ctx.vueCodeBlocks[name] = forVue2 ? [script, forVue2] : script
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


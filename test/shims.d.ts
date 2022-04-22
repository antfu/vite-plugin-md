declare module '*.vue' {
  import type { ComponentOptions, ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}

declare module '*.md' {
  import { Component } from 'vue'

  // export interface MarkdownComponent {
  //   frontmatter: Record<string, unknown>
  //   default: Component
  //   title?: string
  //   layout?: string
  // }
  // const MarkdownComponent: MarkdownComponent

  // export = MarkdownComponent
  const Component: Component
  const frontmatter: Record<string, unknown>

  module.exports = {
    default: Component,
    frontmatter,
  }
}

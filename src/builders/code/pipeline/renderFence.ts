import type { CodeBlockMeta } from '../types'

/**
 * Renders the HTML which results from the code block transform pipeline
 */
export const renderFence = (fence: CodeBlockMeta<'complete'>): string => {
  return `<pre class='${[`language-${fence.lang}`, fence.props.class?.trim()].filter(i => i).join(' ')}'${fence.props.style ? ` style='${fence.props.style}'` : ''}><code>
${fence.code.trim()}
</code></pre>`
}

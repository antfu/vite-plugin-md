import { transformer } from '../utils'

/**
 * Using the MarkdownIt parser we are able to extract raw HTML content
 */
export const parseHtml = transformer('parseHtml', 'parser', 'parsed', (payload) => {
  const html = payload.parser.render(payload.md, {})
  return {
    ...payload,
    html,
  }
})

import { transformer } from '../utils'

/**
 * Using the MarkdownIt parser we are able to extract raw HTML content
 */
export const parseHtml = transformer('parseHtml', 'parser', 'parsed', (payload) => {
  try {
    const html = payload.parser.render(payload.md, {})
    return {
      ...payload,
      html,
    }
  }
  catch (err) {
    console.error(`Parsing with Graymatter package failed. The markdown passed in was:\n${payload.md}\n\n`)
    throw err
  }
})

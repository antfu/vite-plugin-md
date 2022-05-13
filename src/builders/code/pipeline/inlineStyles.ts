import { createInlineStyle } from 'happy-wrapper'
import type { Pipeline, PipelineStage } from '../../../types'
import type { CodeBlockMeta, CodeOptions } from '../code-types'
import { setCodeBlockColors } from '../styles/color/setCodeBlockColors'

/**
 * Applies all inline styles as VueJS <script /> blocks
 */
export const inlineStyles = (p: Pipeline<PipelineStage.parser>, o: CodeOptions) =>
  (fence: CodeBlockMeta<'dom'>): CodeBlockMeta<'dom'> => {
    if (p.codeBlockLanguages.langsRequested.length > 0) {
      const style = createInlineStyle()
        .convertToVueStyleBlock('css', false)
        .addCssVariable('code-col-width', 'auto', '.code-wrapper')
        .addCssVariable('code-border-color', 'gray', '.code-wrapper')
        .addCssVariable('code-text-copy', '#166534')
        .addCssVariable('code-text-copy', '#bbf7d0', 'html.dark')
        .addClassDefinition('.code-wrapper', c => c
          .addProps({
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            overflow: 'hidden',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--prism-background)',
          })
          .addChild('.heading-row', {
            position: 'relative',
            height: 0,
            padding: 0,
            margin: 0,
          })
          .addChild('.heading-row with-heading', {
            padding: '0.5rem',
            height: 'auto',
          })
          .addChild('.heading', {
            color: 'var(--prism-foreground)',
            fontSize: '1.2rem',
            fontWeight: 600,
            padding: '0.25rem 0.5rem 0.25rem 0.5rem',
          })
          .addChild('.heading-row .lang-display', {
            position: 'absolute',
            right: '0.5rem',
            top: '0.325rem',
            fontSize: '0.75rem',
            fontWeight: 300,
            opacity: '75%',
            userSelect: 'none',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyItems: 'center',
          })
          .addChild('.heading-row .lang-display.use-clipboard', {
            cursor: 'pointer',
          })
          .addChild('.heading-row .lang-display.use-clipboard:hover', {
            opacity: 1,
          })
          .addChild('.heading-row .lang-display.use-clipboard:active', {
            color: 'var(--code-text-copy)',
          })
          .addChild('.clipboard', {
            width: '1rem',
            height: '1rem',
            marginLeft: '0.2rem',
            opacity: '.75',
          })
          .addChild('.code-block', {
            fontFamily: o.codeFont || 'var(--code-font)',
          })
          .addChild('table', {
            width: '100%',
            padding: '0.375rem',
            margin: 'auto',
            color: 'var(--prism-foreground)',
            cursor: 'default',
          })
          .addChild('table td', {
            fontSize: '0.875rem',
          })
          .addChild('.line-numbers-mode table td.line-number', {
            width: 'var(--code-col-width)',
            border: '0px',
            opacity: '0.75',
            paddingRight: '0.75rem',
            paddingLeft: '0.25rem',
            textAlign: 'right',
            borderRight: '1px solid',
            borderColor: 'var(--code-border-color)',
          })
          .addChild('.no-line-numbers table td.line-number', {
            width: 0,
            opacity: 0,
            border: 0,
            padding: 0,
            display: 'none',
          })
          .addChild('table td.code-line', {
            width: '100%',
            whiteSpace: 'pre',
            border: '0px',
            lineHeight: '1.4',
            paddingTop: 0,
            paddingBottom: 0,
          })
          .addChild('.no-line-numbers table td.code-line', {
            paddingLeft: '0.5rem',
            borderRadius: '0.325rem',
          })
          .addChild('table tr', {
            backgroundColor: 'var(--prism-background)',
            border: '0px',
            lineHeight: '0.875',
          })
          .addChild('table tr.highlight', {
            backgroundColor: 'var(--prism-lineHighlightBackground)',
            borderRadius: '0.875rem',
          })
          .addChild('table tr.odd.highlight', {
            backgroundColor: 'var(--prism-lineHighlightBackground)',
          })
          .addChild('table tr.even.highlight', {
            backgroundColor: 'var(--prism-lineHighlightBackground)',
          })
          .addChild('table tr.odd', {
            backgroundColor: 'var(--prism-background)',
          })
          .addChild('table tr.even', {
            backgroundColor: 'var(--prism-background)',
          })
          .addChild('.footer', {
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderTop: '1px',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 300,
          }),

        )

      p.addStyleBlock('codeStyle', setCodeBlockColors(style, o, fence.props).finish())
    }

    return fence
  }

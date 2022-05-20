import { mount } from '@cypress/vue'
import TsCodeBlock from '../../fixtures/ts-code-block.md'
import MultiCodeBlock from '../../fixtures/multi-code-block.md'

describe('loading a page with tabular format correctly presents', () => {
  it('load a markdown file with a code block', () => {
    mount(TsCodeBlock)
    cy.get('h1').contains('Code Builder Test')
    cy.get('pre').should('exist')
    cy.get('.code-wrapper').should('exist')
  })

  it('multi code block', () => {
    mount(MultiCodeBlock)
    cy.get('h1').contains('Multi Code Block')
  })
})

import { mount } from '@cypress/vue'
import Simple from '../../fixtures/simple.md'

describe('loading a page with tabular format correctly presents', () => {
  it('load a markdown file with a code block', () => {
    mount(Simple)
    cy.get('h1').contains('My H1')
  })
})

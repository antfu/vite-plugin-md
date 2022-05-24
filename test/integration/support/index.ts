/// <reference types="cypress" />
// https://on.cypress.io/configuration
import './commands'

beforeEach(() => {
  cy.viewport(1200, 800, { log: false })
})

Cypress.Commands.overwrite('submit', <A extends any[]>(...args: A) => {
  const [original, $form] = args
  const spy = cy.spy(() => {
  })
  if ($form)
    $form[0].submit = spy

  return cy.wrap(
    original(...args.slice(1)), { log: false }).wrap(spy, { log: false },
  )
})


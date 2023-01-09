/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

const inboxId = Cypress.env('MAILTRAP_INBOX');
const token = Cypress.env('MAILTRAP_KEY');
const accountId = Cypress.env('MAILTRAP_ACCOUNT_ID');

declare global {
  namespace Cypress {
    interface Chainable {
      getLastEmail(): Chainable<any>;
      clearInbox(): Chainable<any>;
    }
  }
}

Cypress.Commands.add('getLastEmail', () => {
  function requestEmail() {
    return cy
      .request({
        url: `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/messages`,
        headers: {
          'Api-Token': token,
          'Content-Type': 'application/json',
        },
      })
      .then(({ body }) => {
        if (body) {
          const msgId = body[0].id;
          cy.request({
            url: `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/messages/${msgId}/body.html`,

            headers: {
              'Api-Token': token,
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            if (res.body) return res.body;

            cy.wait(1000);
            return requestEmail();
          });
        }
      });
  }

  return requestEmail();
});

Cypress.Commands.add('clearInbox', () => {
  return cy.request({
    headers: {
      'Api-Token': token,
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    url: `https://mailtrap.io/api/accounts/${accountId}/inboxes/${inboxId}/clean`,
  });
});

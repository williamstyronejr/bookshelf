/// <reference types="cypress" />

const inboxId = Cypress.env('MAILTRAP_INBOX');
const token = Cypress.env('MAILTRAP_KEY');
const accountId = Cypress.env('MAILTRAP_ACCOUNT_ID');

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

            // eslint-disable-next-line cypress/no-unnecessary-waiting
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

Cypress.Commands.add('loginUserByEmail', (email: string) => {
  cy.session([email], () => {
    cy.visit('/');
    cy.get("[data-cy='user-menu']").click();

    cy.get('input[name="email"]').type(email);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('eq', '/verify');

    cy.getLastEmail().then((html) => {
      const link = html.match(/href="([^"]*)/)[1];
      cy.expect(link).to.contains('/api/auth/callback/email');
      cy.visit(link);
      cy.clearInbox();
    });
  });
});

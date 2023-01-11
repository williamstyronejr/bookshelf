describe('Signin/Signup', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get("[data-cy='user-menu']").click();
  });

  it('Invalid email should show error notification', () => {
    const invalidEmail = 'test';
    cy.get('input[name="email"]').type(invalidEmail);
    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="auth-error-field"]').should('have.length', 1);
  });

  it('Valid email should redirect to verify page', () => {
    const validEmail = 'email@email.com';
    cy.get('input[name="email"]').type(validEmail);
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

describe('Log out', () => {
  const email = 'email@email.com';

  before(() => {
    cy.loginUserByEmail(email);
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('Logging out should redirect a user to homepage and update user menu to signin', () => {
    cy.contains(email).should('have.length.at.least', 1);
    cy.get("[data-cy='user-menu']").click();
    cy.get('[data-cy="logout"]').click();

    cy.contains('Signin').should('have.length.at.least', 1);
    cy.get("[data-cy='user-menu']").click();
    cy.location('pathname').should('eq', '/signin');
  });
});

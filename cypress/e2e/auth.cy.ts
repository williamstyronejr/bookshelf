describe('Signin', () => {
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

describe('', () => {
  const email = 'testing@email.com';
  beforeEach(() => {
    cy.loginUserByEmail(email);
    cy.visit('/');

    cy.get('[data-cy="user-menu"').click();
    cy.contains('Settings').click();
  });

  it('Invalid inputs should show input errors', () => {
    const invalidUsername = 't';
    const invalidEmail = 'test';
    cy.get("input[name='username']").clear();
    cy.get("input[name='email']").clear();
    cy.get("input[name='username']").type(invalidUsername);
    cy.get("input[name='email']").type(invalidEmail);

    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="input-error"').should('have.length', 2);
  });

  it('Valid username change should show success notification', () => {
    const validUsername = 'testing';

    cy.get("input[name='username']").clear();
    cy.get("input[name='username']").type(validUsername);

    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="form-success"').should('have.length', 1);
  });

  it('Valid email change should show success notification', () => {
    const validEmail = 'testing@email.com';

    cy.get("input[name='email']").clear();
    cy.get("input[name='email']").type(validEmail);

    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="form-success"').should('have.length', 1);
  });
});

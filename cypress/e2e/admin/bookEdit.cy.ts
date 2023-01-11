import { adminEmail } from '../../utils';

describe('Edit book as Admin', () => {
  beforeEach(() => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');

    cy.contains('Books').click();
    cy.location('pathname').should('eq', '/library');
    cy.get('[data-cy="carousel-book"]').first().click();
    cy.location('pathname').should('contain', '/book');
  });

  it('Removing required input fields should display input errors', () => {
    cy.get('[data-cy="admin-menu"]').click();
    cy.contains('Edit Book').click();
    cy.location('pathname').should('contain', '/admin/book');
    cy.get('input[name="title"]').clear();

    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="input-error"]').should('have.length.at.least', 1);
  });
});

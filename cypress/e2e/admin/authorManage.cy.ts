import { adminEmail } from '../../utils';

describe('Users without permissions', () => {
  it('Non auth user should get redirected to signin', () => {
    cy.visit('/');

    // Ensuring no users is logged in by user menu showing signin
    cy.get("[data-cy='user-menu']").contains('Signin');

    // Force visiting since link is not available to user
    cy.visit('/admin/author/manage');
    cy.location('pathname').should('eq', '/signin');
  });

  it('Non admin user should get redirected to permissions page', () => {
    const email = 'email@email.com';
    cy.loginUserByEmail(email);
    cy.visit('/');

    // User menu should be available, but admin links should not be present
    cy.get("[data-cy='user-menu']").click();
    cy.contains('Manage Author').should('not.exist');

    // Force visiting since link is not available to user
    cy.visit('/admin/author/manage');
    cy.location('pathname').should('eq', '/permissions');
  });

  it('Admin user should be allowed access to page', () => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');

    cy.get("[data-cy='user-menu']").click();
    cy.contains('Manage Author').click();
    cy.location('pathname').should('eq', '/admin/author/manage');
  });
});

describe('Admin User', () => {
  beforeEach(() => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');
    cy.get("[data-cy='user-menu']").click();
    cy.contains('Manage Author').click();
  });

  it('Clicking the edit button should redirect to edit page', () => {
    cy.get('[data-cy="author-manage-list"] li').should(
      'have.length.at.least',
      1
    );
    cy.get('[data-cy="author-manage-list"] li')
      .first()
      .contains('Edit')
      .click();
    cy.location('pathname').should('contain', '/edit');
  });
});

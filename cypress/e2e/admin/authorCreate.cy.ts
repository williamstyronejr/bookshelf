import { adminEmail } from '../../utils';

describe('Users without permissions', () => {
  it('Non auth user should get redirected to signin', () => {
    cy.visit('/');

    // Ensuring no users is logged in by user menu showing signin
    cy.get("[data-cy='user-menu']").contains('Signin');

    // Force visiting since link is not available to user
    cy.visit('/admin/author/create');
    cy.location('pathname').should('eq', '/signin');
  });

  it('Non admin user should get redirected to permissions page', () => {
    const email = 'email@email.com';
    cy.loginUserByEmail(email);
    cy.visit('/');

    // User menu should be available, but admin links should not be present
    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Author').should('not.exist');

    // Force visiting since link is not available to user
    cy.visit('/admin/author/create');
    cy.location('pathname').should('eq', '/permissions');
  });

  it('Admin user should be allowed access to page', () => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');

    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Author').click();
    cy.location('pathname').should('eq', '/admin/author/create');
  });
});

describe('Admin users', () => {
  beforeEach(() => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');

    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Author').click();
    cy.location('pathname').should('eq', '/admin/author/create');
  });

  it('Empty inputs should display input errors', () => {
    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="input-error"').should('have.length.at.least', 1);
  });

  it('Invalid bio (over 1000 characters) should display input error', () => {
    const name = 'Testng';
    const bio = 'x'.repeat(1200);

    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="bio"]').type(bio);
    cy.get('button[type="submit"]').click();

    cy.get('[data-cy="input-error"').should('have.length.at.least', 1);
  });

  it('Valid inputs should redirect to author page', () => {
    const name = 'New author name1';
    const bio = 'This bio';
    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="bio"]').type(bio);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('not.contain', '/admin/author/create');
    cy.contains(name).should('exist');
  });

  it('Creating two valid author with same name should show no error ', () => {
    const name = 'Edwin Larry';
    const bio = 'This bio';

    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="bio"]').type(bio);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('not.contain', '/admin/author/create');
    cy.contains(name).should('exist');

    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Author').click();

    cy.get('input[name="name"]').type(name);
    cy.get('textarea[name="bio"]').type(bio);
    cy.get('button[type="submit"]').click();

    cy.location('pathname').should('not.contain', '/admin/author/create');
    cy.contains(name).should('exist');
  });
});

import { adminEmail } from '../../utils';

describe('Users without permissions', () => {
  it('Non auth user should get redirect to the signin when visiting creation page', () => {
    cy.visit('/');

    // Clicking the user menu (where create book) ensuring no user
    cy.get("[data-cy='user-menu']").click();
    cy.location('pathname').should('eq', '/signin');

    // Force visiting since link is not available to user
    cy.visit('/admin/book/create');
    cy.location('pathname').should('eq', '/signin');
  });

  it('Non admin user should get redirected to a permissions page when visiting', () => {
    const email = 'email@email.com';
    cy.loginUserByEmail(email);
    cy.visit('/');

    // User menu should be available, but admin links should not be present
    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Book').should('not.exist');

    // Force visiting since link is not available to user
    cy.visit('/admin/book/create');
    cy.location('pathname').should('eq', '/permissions');
  });

  it('Admin user should be properly directed to the correct page.', () => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');

    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Book').click();
    cy.location('pathname').should('eq', '/admin/book/create');
  });
});

describe('Admin users', () => {
  beforeEach(() => {
    cy.loginUserByEmail(adminEmail);
    cy.visit('/');
    cy.get("[data-cy='user-menu']").click();
    cy.contains('Create Book').click();
  });

  it('Submitting form with empty fields should display input errors', () => {
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="input-error"]').should('have.length.at.least', 1);
  });

  it('Valid inputs should redirect to book page', () => {
    const title = 'Book title testing';
    const isbn13 = '1234567werty';
    const description = 'This is a test description';
    const pageCount = '123';
    const copiesCount = '123';
    const publishedDate = '01/01/2020';
    const genre = 'Fant';
    const language = 'engl';
    const author = 'a';
    const publisher = 'T';

    cy.get('input[name="title"]').type(title);
    cy.get('textarea[name="description"]').type(description);
    cy.get('input[name="isbn13"]').type(isbn13);
    cy.get('input[name="pageCount"]').type(pageCount);
    cy.get('input[name="copiesCount"]').type(copiesCount);
    cy.get('input[name="publishedDate"]').type(publishedDate);

    cy.get('input[name="genre-placeholder"]').type(genre);
    cy.get('input[name="genre-placeholder"]').focus();
    cy.get('[data-cy="input-suggestion"]').first().click();

    cy.get('input[name="language-placeholder"]').type(language);
    cy.get('input[name="language-placeholder"]').focus();
    cy.get('[data-cy="input-suggestion"]').first().click();

    cy.get('input[name="author-placeholder"]').type(author);
    cy.get('input[name="author-placeholder"]').focus();
    cy.get('[data-cy="input-suggestion"]').first().click();

    cy.get('input[name="publisher-placeholder"]').type(publisher);
    cy.get('input[name="publisher-placeholder"]').focus();
    cy.get('[data-cy="input-suggestion"]').first().click();

    cy.get('button[type="submit"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);
    cy.location('pathname').should('not.contain', '/admin/book/create');
  });
});

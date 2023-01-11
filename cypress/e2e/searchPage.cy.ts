describe('Searching', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Searching on home page should redirect user to search page with results', () => {
    const searchText = 'harry potter';
    cy.get('input[name="search"]').type(`${searchText}{enter}`);
    cy.location('pathname').should('contain', '/library/search');

    cy.get('[data-cy="search-results"] li').should('have.length.at.least', 1);
  });

  it('Search containing no results should display a message', () => {
    const searchText = 'urewnuri283rhunejkqri2390rlekrkmlf';
    cy.get('input[name="search"]').type(`${searchText}{enter}`);
    cy.location('pathname').should('contain', '/library/search');

    cy.get('[data-cy="search-empty"]').should('have.length', 1);
  });
});

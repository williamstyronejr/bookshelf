describe('Non-auth User', () => {
  const email = 'testing@email.com';
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Books').click();
    cy.location('pathname').should('eq', '/library');
    cy.get('[data-cy="carousel-book"]').first().click();
    cy.location('pathname').should('contain', '/book');
  });

  it('Non-user trying to reserve a book should be redirected to login page', () => {
    cy.get('[data-cy="reserve"]').click();
    cy.location('pathname').should('contain', '/signin');
  });

  it('Favorite button should not appear', () => {
    cy.get('[data-cy="favorite"]').should('not.exist');
  });
});

describe('Reservations as Auth User', () => {
  const email = 'testing@email.com';
  beforeEach(() => {
    cy.loginUserByEmail(email);
    cy.visit('/');

    cy.contains('Books').click();
    cy.location('pathname').should('eq', '/library');
    cy.get('[data-cy="carousel-book"]').first().click();
    cy.location('pathname').should('contain', '/book');
  });

  it('Favoriting a book should change the icon and add it to user favorite list', () => {
    cy.get('[data-cy="favorite"]').click();
    cy.get('[aria-label="Favorited"]').should('have.length', 1);

    cy.contains('Favorites').click();
    cy.get('[data-cy="favorite-item"]').should('have.length.gte', 1);
  });

  it('Making reservation should show a success notification', () => {
    cy.get('[data-cy="reserve"]').click();
    cy.get('[data-cy="reserve-book"]').click();
    cy.get('[data-cy="form-success"]').should('have.length', 1);

    cy.contains('Reservation').click();
    cy.location('pathname').should('eq', '/dashboard/reservations');
    cy.get('[data-cy="reservation-item"]').should('have.length.at.least', 1);
  });

  it('Making a reservation with non default time should show up in reservation list', () => {
    cy.get('[data-cy="reserve"]').click();
    cy.get('[data-cy="reserve-length"]').click();
    cy.get('[data-cy="reserve-length-14"]').click();
    cy.get('[data-cy="reserve-book"]').click();
    cy.get('[data-cy="form-success"]').should('have.length', 1);

    cy.contains('Reservation').click();
    cy.location('pathname').should('eq', '/dashboard/reservations');
    cy.get('[data-cy="reservation-item"]').should('have.length.at.least', 1);
    cy.contains('in 14 days');
  });
});

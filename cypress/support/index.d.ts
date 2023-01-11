declare namespace Cypress {
  interface Chainable {
    getLastEmail(): Chainable<any>;
    clearInbox(): Chainable<any>;
    loginUserByEmail(email: string): Chainable<any>;
  }
}

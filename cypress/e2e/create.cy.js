describe('Create Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/virtual-business-cards/#/create');
  });

  it('should allow user to edit business card fields', () => {
    cy.get('.name', { timeout: 10000 })
      .should('be.visible')
      .focus()
      .clear()
      .type('Jane Doe')
      .should('have.text', 'Jane Doe');

    cy.get('.title', { timeout: 10000 })
      .should('be.visible')
      .focus()
      .clear()
      .type('Software Engineer')
      .should('have.text', 'Software Engineer');

    cy.get('.organization', { timeout: 10000 })
      .should('be.visible')
      .focus()
      .clear()
      .type('Tech Company')
      .should('have.text', 'Tech Company');
  });

  it('should allow changing image URLs', () => {
    cy.get('.add-images').click();
    cy.get('.bg-white.rounded-lg', { timeout: 10000 }).should('be.visible');
    cy.get('.add-logo').clear().type('https://example.com/logo.png');
    cy.get('.add-bg').clear().type('https://example.com/background.jpg');
    cy.get('.submit').click();
    cy.get('.bg-white.rounded-lg').should('not.exist');
  });

  it('should toggle text color when clicking the toggle button', () => {
    cy.get('.name').parent().parent().should('have.class', 'text-white');
    cy.get('.change-textcolor').click();
    cy.get('.name').parent().parent().should('have.class', 'text-black');
  });

  it('should save the card and navigate to profile page', () => {
    cy.get('.name', { timeout: 10000 }).focus().clear().type('Jane Doe');
    cy.intercept('POST', '**/save*').as('saveCard');
    cy.get('.save').click();
    cy.wait('@saveCard').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/profile');
  });
});
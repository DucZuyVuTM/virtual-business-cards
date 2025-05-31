describe('Profile Page', () => {
  const mockCards = [
    {
      id: '1',
      name: 'Jane Doe',
      title: 'Software Engineer',
      organization: 'Tech Company',
      backgroundImage: 'https://example.com/background.jpg',
    },
    {
      id: '2',
      name: 'John Smith',
      title: 'Designer',
      organization: 'Creative Studio',
    },
  ];

  const mockImageData = {
    '1': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
    '2': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  };

  beforeEach(() => {
    // Mock localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('savedCards', JSON.stringify({ cards: mockCards }));
    });

    // Mock API call for images
    cy.intercept('POST', 'http://localhost:5000/api/get-images', {
      statusCode: 200,
      body: {
        images: mockCards.map((card) => ({
          id: card.id,
          image_data: mockImageData[card.id],
        })),
      },
    }).as('getImages');

    // Visit profile page
    cy.visit('http://localhost:3000/virtual-business-cards/#/profile');
    cy.wait('@getImages');
    cy.get('.profile', { timeout: 10000 }).should('be.visible');
  });

  it('should display the profile header with correct card count', () => {
    cy.get('.profile-header').should('have.text', 'Your Profile -- 2 cards');
  });

  it('should render cards with correct details', () => {
    cy.get('.card-grid').find('.card-item').should('have.length', 2);

    cy.get('.card-item').first().within(() => {
      cy.get('.card-name').should('have.text', 'Jane Doe');
      cy.get('.card-title').should('have.text', 'Software Engineer');
      cy.get('.card-organization').should('have.text', 'Tech Company');
      cy.get('.preview-image').should('have.attr', 'src').and('include', 'data:image/png;base64');
    });

    cy.get('.card-item').last().within(() => {
      cy.get('.card-name').should('have.text', 'John Smith');
      cy.get('.card-title').should('have.text', 'Designer');
      cy.get('.card-organization').should('have.text', 'Creative Studio');
    });
  });

  it('should close popup when clicking close button or overlay', () => {
    cy.get('.card-item').first().click();
    cy.get('.popup-container', { timeout: 10000 }).should('be.visible');
    cy.get('.close-button').click();
    cy.get('.popup-container').should('not.exist');

    cy.get('.card-item').first().click();
    cy.get('.popup-overlay').click({ force: true });
    cy.get('.popup-container').should('not.exist');
  });

  it('should navigate to create page when clicking Create New Card', () => {
    cy.get('.create-new-button').click();
    cy.url().should('include', '/create');
  });

  it('should navigate to create page with card data when clicking Edit', () => {
    cy.get('.card-item').first().click();
    cy.get('.popup-container', { timeout: 10000 }).should('be.visible');
    cy.get('.edit-button').click();
    cy.url().should('include', '/create');
  });

  it('should delete a card', () => {
    cy.intercept('DELETE', 'http://localhost:5000/api/delete-card/1', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteCard');

    cy.get('.card-item').first().click();
    cy.get('.popup-container', { timeout: 10000 }).should('be.visible');
    cy.get('.delete-button').click();
    cy.wait('@deleteCard');
    cy.get('.card-grid').find('.card-item').should('have.length', 1);
    cy.get('.profile-header').should('have.text', 'Your Profile -- 1 card');
    cy.window().then((win) => {
      const saved = JSON.parse(win.localStorage.getItem('savedCards') || '{"cards": []}');
      expect(saved.cards).to.have.length(1);
      expect(saved.cards[0].id).to.equal('2');
    });
  });

  it('should download image when clicking Download', () => {
    cy.window().then((win) => {
      cy.spy(win.HTMLAnchorElement.prototype, 'click').as('downloadClick');
    });

    cy.get('.card-item').first().click();
    cy.get('.popup-container', { timeout: 10000 }).should('be.visible');
    cy.get('.download-button').click();
    cy.get('@downloadClick').should('have.been.called');
  });

  it('should display single-column grid on mobile', () => {
    cy.viewport('iphone-6');
    cy.get('.card-grid').should('have.css', 'grid-template-columns', '343.333px');
  });

  it('should display two-column grid on desktop', () => {
    cy.viewport('macbook-15');
    cy.get('.card-grid').should('have.css', 'grid-template-columns', '616px 616px');
  });
});
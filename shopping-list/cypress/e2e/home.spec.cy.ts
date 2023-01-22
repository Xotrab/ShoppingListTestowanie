import { fillCreateListFields, formatDeadline, preRegister, tryToLogout } from "./e2e-utils";
import { uuidv4 } from '@firebase/util';

describe('Home', () => {

    before(() => {
        preRegister();
    });

    after(() => {
        tryToLogout();
    });

    it('should create new shopping list and add it to the table', () => {
      const id = uuidv4().slice(0,8);
      const deadline = new Date().toDateString();
      const createListButton = cy.get("button").contains("Create shopping list");

      fillCreateListFields(id, deadline);

      createListButton.click();

      cy.wait(500);

      const firstRow = cy.get('table').find('tbody').children("tr").eq(0);

      firstRow.get("#nameCell").should('contain.text', id);
      firstRow.get("#deadlineCell").should('contain.text', formatDeadline(deadline));
    });

    it('should remove a shopping list', () => {
      cy.visit("/home");
      const removeListButton = cy.get("button").contains("Remove");

      removeListButton.click();

      const noDataRow = cy.get('table').find('tbody').children("tr").eq(0);

      noDataRow.children("td").eq(0).should('contain.text', "No Shopping lists yet");
    });

    it('should show snackBar message when shopping list name was not provided', () => {
      cy.visit("/home");
      const deadline = new Date().toDateString();
      const createListButton = cy.get("button").contains("Create shopping list");

      cy.get("#deadlineInput").invoke('attr', 'readonly', false);
      cy.get("#deadlineInput").type(deadline);
      cy.get("#nameInput").click();

      createListButton.click();

      cy.wait(250);

      cy.get('.mat-simple-snack-bar-content').should('contain.text', 'Please provide the name and the deadline in order to create the shopping list');

      cy.wait(3000);
    });

    it('should show snackBar message when shopping list deadline was not provided', () => {
      cy.visit("/home");
      const id = uuidv4().slice(0,8);
      const createListButton = cy.get("button").contains("Create shopping list");

      cy.get("#nameInput").type(id);
      cy.get("#nameInput").click();

      createListButton.click();

      cy.wait(250);

      cy.get('.mat-simple-snack-bar-content').should('contain.text', 'Please provide the name and the deadline in order to create the shopping list');
    });
})

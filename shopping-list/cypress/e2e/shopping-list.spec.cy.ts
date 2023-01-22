import { createList, fillAddItemFieldsForCommonItem, fillAddItemFieldsForOwnItem, formatDeadline, preRegister, removeList, tryToLogout, tryToRemoveItem } from "./e2e-utils";

describe('Shopping list', () => {

    before(() => {
        preRegister();
        createList();
    });

    after(() => {
        removeList();
        tryToLogout();
    });

    afterEach(() => {
        tryToRemoveItem();
    });

    it('should add common item without an image', () => {
        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();

        fillAddItemFieldsForCommonItem("water", "1", "l");

        const addItemButton = cy.get("button").contains("Add item");
        addItemButton.click();

        cy.wait(500);

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);

        firstRow.get("#nameCell").should('contain.text', "water");
        firstRow.get("#quantityCell").should('contain.text', "1");
        firstRow.get("#unitCell").should('contain.text', "l");
        firstRow.get("#imageCell>div").should('contain.text', "No image provided");
    });

    it('should add own item without an image', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();

        const ownRadioButton = cy.get("mat-radio-button").eq(1);

        ownRadioButton.get('[type="radio"]').check({force: true});

        fillAddItemFieldsForOwnItem("juice", "2", "ml");

        const addItemButton = cy.get("button").contains("Add item");
        addItemButton.click();

        cy.wait(500);

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);

        firstRow.get("#nameCell").should('contain.text', "juice");
        firstRow.get("#quantityCell").should('contain.text', "2");
        firstRow.get("#unitCell").should('contain.text', "ml");
        firstRow.get("#imageCell>div").should('contain.text', "No image provided");
    });

    it('should add common item with an image', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();

        fillAddItemFieldsForCommonItem("water", "1", "l");

        cy.get('input[type=file]').selectFile('cypress/fixtures/drejk.jpg', { force: true });

        const addItemButton = cy.get("button").contains("Add item");
        addItemButton.click();

        cy.wait(500);

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);

        firstRow.get("#nameCell").should('contain.text', "water");
        firstRow.get("#quantityCell").should('contain.text', "1");
        firstRow.get("#unitCell").should('contain.text', "l");
        firstRow.get("#imageCell").get('img').should('be.visible');
    });

    it('should add item and remove it', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();

        fillAddItemFieldsForCommonItem("water", "1", "l");

        const addItemButton = cy.get("button").contains("Add item");
        addItemButton.click();

        cy.wait(500);

        tryToRemoveItem();

        const noDataRow = cy.get('table').find('tbody').children("tr").eq(0);

        noDataRow.children("td").eq(0).should('contain.text', "No items have been added yet");
    });

    it('should show snackBar when provided input was not valid', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();

        cy.get('#quantityInput').type("1");

        cy.get('#unitSelect').click();
        cy.get('mat-option').contains("kg").click();

        const addItemButton = cy.get("button").contains("Add item");
        addItemButton.click();

        cy.get('.mat-simple-snack-bar-content').should('contain.text', 'The provided input for the new item is invalid');

        cy.wait(3000);
    });

    it('should update shopping list name', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();
        
        const newName = 'newName';

        cy.get('#listNameInput').clear().type(newName);
        cy.get('button').contains('Update name').click();

        cy.get('.mat-simple-snack-bar-content').should('contain.text', 'The shopping list name has been successfully updated');

        cy.wait(3000);

        cy.visit("/home");

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#nameCell").should('contain.text', newName);

        cy.get("button").contains("Details").click();

        cy.get('#listNameInput').should('have.value', newName);
    });

    it('should update shopping list deadline', () => {
        cy.visit("/home");

        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();
        
        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate()+1);
        const newDeadlineStr = newDeadline.toDateString();

        cy.get("#listDeadlineInput").invoke('attr', 'readonly', false);
        cy.get("#listDeadlineInput").clear().type(newDeadlineStr);

        cy.get('button').contains('Update deadline').click();

        cy.get('.mat-simple-snack-bar-content').should('contain.text', 'The shopping list deadline has been successfully updated');

        cy.wait(3000);

        cy.visit("/home");

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#deadlineCell").should('contain.text', formatDeadline(newDeadlineStr));

        cy.get("button").contains("Details").click();

        cy.get('#listDeadlineInput').should('have.value', formatDeadline(newDeadlineStr));
    });
});
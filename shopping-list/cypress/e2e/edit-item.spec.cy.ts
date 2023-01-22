import { addItem, createList, fillEditItemFields, preRegister, removeList, tryToLogout } from "./e2e-utils";

describe('Edit item', () => {

    before(() => {
        preRegister();
        createList();
        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();
        addItem();
    });

    beforeEach(() => {
        cy.visit('/home');
        cy.wait(500);
        const detailsButton = cy.get("button").contains("Details");
        detailsButton.click();
        
        cy.wait(500);
        const editButton = cy.get("button").contains("Edit");
        editButton.click();
    });

    after(() => {
        removeList();
        tryToLogout();
    });

    it('should cross out item in a table when purchased has been checked', () => {
        cy.get('#purchasedCheckbox').find('input').click({force:true});

        const editItemButton = cy.get("button").contains("Edit item");
        editItemButton.click();

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#nameCell").should('have.class', 'cross-out');
        firstRow.get("#quantityCell").should('have.class', 'cross-out');
        firstRow.get("#unitCell").should('have.class', 'cross-out');
    });

    it('should update item fields', () => {
        fillEditItemFields('newName', '4', 'dkg');

        const editItemButton = cy.get("button").contains("Edit item");
        editItemButton.click();

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#nameCell").should('contain.text', "newName");
        firstRow.get("#quantityCell").should('contain.text', "4");
        firstRow.get("#unitCell").should('contain.text', "dkg");
    });

    it('should remove image', () => {
        const removeImageButton = cy.get("button").contains("Remove image");
        removeImageButton.click();

        const editItemButton = cy.get("button").contains("Edit item");
        editItemButton.click();

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#imageCell>div").should('contain.text', "No image provided");
    });

    it('should add image', () => {
        cy.get('#editImageInput').selectFile('cypress/fixtures/drejk.jpg', { force: true });

        const editItemButton = cy.get("button").contains("Edit item");
        editItemButton.click();

        const firstRow = cy.get('table').find('tbody').children("tr").eq(0);
        firstRow.get("#imageCell").get('img').should('be.visible');
    });

    it('should show snackBar with error when update values were not provided', () => {
        cy.get('#editNameInput').clear();
        cy.get('#editQuantityInput').clear();

        const editItemButton = cy.get("button").contains("Edit item");
        editItemButton.click();

        cy.get('.mat-simple-snack-bar-content').should('contain.text', 'The provided input for the new item is invalid');

        const closeDialogButton = cy.get("button").contains("Cancel");
        closeDialogButton.click();
    });
});
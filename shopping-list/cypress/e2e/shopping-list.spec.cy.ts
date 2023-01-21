import { createList, fillAddItemFieldsForCommonItem, fillAddItemFieldsForOwnItem, preRegister, removeList, tryToLogout, tryToRemoveItem } from "./e2e-utils";

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
});
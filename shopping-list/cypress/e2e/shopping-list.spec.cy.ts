import { createList, fillAddItemFieldsForCommonItem, preRegister, removeList, tryToLogout } from "./e2e-utils";

describe('Shopping list', () => {
    
    before(() => {
        preRegister();
        createList();
    });

    after(() => {
        removeList();
        tryToLogout();
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
});
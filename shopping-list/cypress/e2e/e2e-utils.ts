import { uuidv4 } from '@firebase/util';

export function fillRegisterForm(email: string, username: string, password: string, confirmPassword: string) {
    cy.get('[formcontrolname="email"]').type(email, {force: true});
    cy.get('[formcontrolname="username"]').type(username, {force: true});
    cy.get('[formcontrolname="password"]').type(password, {force: true});
    cy.get('[formcontrolname="confirmPassword"]').type(confirmPassword, {force: true});

    cy.get('[formcontrolname="email"]').click();
}

export function fillLoginForm(email: string, password: string) {
    cy.get('[formcontrolname="email"]').type(email);
    cy.get('[formcontrolname="password"]').type(password);

    cy.get('[formcontrolname="email"]').click();
}

export function preRegister() {
    cy.visit("/register");

    const id = uuidv4().slice(0,8);
    fillRegisterForm(`${id}@domain.com`, `${id}Username`, "Test1234", "Test1234");

    const registerButton = cy.get("#registerButton");
    registerButton.click();

    cy.wait(3000);
    
    return {
        email: `${id}@domain.com`,
        password: "Test1234"
    };
}

export function tryToLogout() {
    cy.get('body').then(($body) => {
        if ($body.find('#logoutButton').length > 0) {
            cy.wait(2000);
            cy.get('#logoutButton').click();
            cy.wait(2000);
        }
    });
}

export function fillCreateListFields(id: string, deadline: string) {
    cy.get("#nameInput").type(id);
    cy.get("#deadlineInput").invoke('attr', 'readonly', false);
    cy.get("#deadlineInput").type(deadline);
    cy.wait(500);
    cy.get("#nameInput").click();
}

export function formatDeadline(dateString: string): string {
    const date = new Date(dateString);
    
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function createList() {
    const id = uuidv4().slice(0,8);
    const deadline = new Date().toDateString();
    const createListButton = cy.get("button").contains("Create shopping list");

    fillCreateListFields(id, deadline);

    createListButton.click();

    cy.wait(500);
}

export function removeList() {
    cy.visit("/home");
    const removeListButton = cy.get("button").contains("Remove");

    removeListButton.click();
    cy.wait(250);
}

export function fillAddItemFieldsForCommonItem(name: string, quantity: string, unit: string) {
    cy.get('#nameSelect').click();
    cy.get('mat-option').contains(name).click();

    cy.get('#quantityInput').type(quantity);

    cy.get('#unitSelect').click();
    cy.get('mat-option').contains(unit).click();
}

export function fillAddItemFieldsForOwnItem(name: string, quantity: string, unit: string) {
    cy.get('#nameInput').type(name);

    cy.get('#quantityInput').type(quantity);

    cy.get('#unitSelect').click();
    cy.get('mat-option').contains(unit).click();
}

export function tryToRemoveItem() {
    cy.get('body').then(($body) => {
        if ($body.find(":contains('Remove')").length > 0) {
            cy.wait(1000);
            cy.get('button').contains("Remove").click();
            cy.wait(1000);
        }
    });
}

export function addItem() {
    const ownRadioButton = cy.get("mat-radio-button").eq(1);

    ownRadioButton.get('[type="radio"]').check({force: true});

    fillAddItemFieldsForOwnItem("water", "1", "l");

    cy.get('input[type=file]').selectFile('cypress/fixtures/drejk.jpg', { force: true });

    const addItemButton = cy.get("button").contains("Add item");
    addItemButton.click();

    cy.wait(250);
}

export function fillEditItemFields(name: string, quantity: string, unit: string) {
    cy.get('#editNameInput').clear().type(name);

    cy.get('#editQuantityInput').clear().type(quantity);

    cy.get('#editUnitSelect').click();
    cy.get('mat-option').contains(unit).click();
}
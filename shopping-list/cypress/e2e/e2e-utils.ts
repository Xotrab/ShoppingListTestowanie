import { uuidv4 } from '@firebase/util';

export function fillRegisterForm(email: string, username: string, password: string, confirmPassword: string) {
    cy.get('[formcontrolname="email"]').type(email);
    cy.get('[formcontrolname="username"]').type(username);
    cy.get('[formcontrolname="password"]').type(password);
    cy.get('[formcontrolname="confirmPassword"]').type(confirmPassword);

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
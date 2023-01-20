import { uuidv4 } from '@firebase/util';

export function fillRegisterForm(email: string, username: string, password: string, confirmPassword: string) {
    cy.get('[formcontrolname="email"]').type(email);
    cy.get('[formcontrolname="username"]').type(username);
    cy.get('[formcontrolname="password"]').type(password);
    cy.get('[formcontrolname="confirmPassword"]').type(confirmPassword);

    cy.get('[formcontrolname="username"]').click();
}

export function preRegister() {
    cy.visit("/register");

    const id = uuidv4().slice(0,8);
    fillRegisterForm(`${id}@domain.com`, `${id}Username`, "Test1234", "Test1234");

    const registerButton = cy.get("#registerButton");
    registerButton.click();

    cy.wait(5000);
    
    return {
        mail: `${id}@domain.com`,
        password: "Test1234"
    };
}
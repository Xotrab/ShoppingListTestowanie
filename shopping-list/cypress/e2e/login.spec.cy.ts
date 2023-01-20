import { fillLoginForm, preRegister, tryToLogout } from "./e2e-utils";

describe('Login', () => {
    let loginCredentials: { email: string, password: string };

    before(() => {
        loginCredentials = preRegister();
        cy.get('#logoutButton').click();
        cy.wait(2000);
    });

    afterEach(() => {
        tryToLogout();
    });

    it('should login when provided credentials were valid', () => {
        cy.visit("/");

        fillLoginForm(loginCredentials.email, loginCredentials.password);

        const loginButton = cy.get("#loginButton");
        loginButton.click();

        cy.location({ timeout: 5000 })
            .should(loc => expect(loc.pathname).equal("/home"));
        
        cy.contains("Logout");
    });

    it('should logout after login', () => {
        cy.visit("/");

        fillLoginForm(loginCredentials.email, loginCredentials.password);

        const loginButton = cy.get("#loginButton");
        loginButton.click();

        cy.wait(1000);
        cy.get('#logoutButton').click();
        cy.wait(1000);

        cy.location({ timeout: 5000 })
            .should(loc => expect(loc.pathname).equal("/"));
    });

    it('should show error when an email was not provided', () => {
        cy.visit("/");

        const loginButton = cy.get("#loginButton");
        loginButton.click();

        cy.get("mat-error").contains("Provide an email");
    });

    it('should show error when a password was not provided', () => {
        cy.visit("/");

        const loginButton = cy.get("#loginButton");
        loginButton.click();

        cy.get("mat-error").contains("Provide an email");
    });

    it('should show snackBar message when provided credentials were invalid', () => {
        cy.visit("/");

        fillLoginForm(loginCredentials.email, "wrongPassword");

        const loginButton = cy.get("#loginButton");
        loginButton.click();

        cy.wait(2000);
        cy.get('.mat-simple-snack-bar-content').contains('Wrong credentials');
    });
});
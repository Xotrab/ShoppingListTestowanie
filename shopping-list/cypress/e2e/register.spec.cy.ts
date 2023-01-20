import { uuidv4 } from '@firebase/util';
import { fillRegisterForm, tryToLogout } from './e2e-utils';

describe('Register', () => {
    
    afterEach(() => {
        // Logout after each test (only if currently logged in)
        tryToLogout();
      })

    it('Should register and navigate to /home when provided form data was valid', () => {
        cy.visit("/register");

        const id = uuidv4().slice(0,8);
        fillRegisterForm(`${id}@domain.com`, `${id}Username`, "Test1234", "Test1234");

        const registerButton = cy.get("#registerButton");
        registerButton.click();

        cy.location({ timeout: 5000 })
            .should(loc => expect(loc.pathname).equal("/home"));
    });

    it('Should show email error', () => {
        cy.visit("/register");

        const id = uuidv4().slice(0,8);
        fillRegisterForm("wrong@", `${id}Username`, "Test1234", "Test1234");

        cy.get("mat-error").contains("Provide an email");
    });

    it('Should show username error', () => {
        cy.visit("/register");

        const id = uuidv4().slice(0,8);
        fillRegisterForm(`${id}@domain.com`, `u`, "Test1234", "Test1234");

        cy.get("mat-error").contains("Username has to have between 2 and 20 characters");
    });

    it('Should show password error', () => {
        cy.visit("/register");

        const id = uuidv4().slice(0,8);
        fillRegisterForm(`${id}@domain.com`, `${id}Username`, "Test", "Test");

        cy.get("mat-error").contains("Provide at least one digit, one lower and upper case letter and between 5 to 25 characters");
    });

    it('Should show password mismatch error', () => {
        cy.visit("/register");

        const id = uuidv4().slice(0,8);
        fillRegisterForm(`${id}@domain.com`, `${id}Username`, "Test1234", "Test12345");

        cy.get("mat-error").contains("Passwords do not match");
    });
});
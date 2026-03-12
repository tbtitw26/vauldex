import test from "node:test";
import assert from "node:assert/strict";

import { authService } from "../src/backend/services/auth.service";
import { User } from "../src/backend/models/user.model";
import { mailService } from "../src/backend/services/mail.service";
import { RegistrationValidationError } from "../src/shared/registration";

const validRegistration = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    password: "supersecret",
    phone: "+1 202 555 0123",
    addressStreet: "123 Main Street",
    addressCity: "New York",
    addressCountry: "US",
    addressPostalCode: "10001",
    birthDate: "1990-01-15",
};

test("backend registration rejects blocked countries", async () => {
    const originalFindOne = User.findOne;

    try {
        User.findOne = (async () => null) as typeof User.findOne;

        await assert.rejects(
            () => authService.register({ ...validRegistration, addressCountry: "RU" }),
            (error: unknown) => {
                assert.ok(error instanceof RegistrationValidationError);
                assert.equal(
                    error.fields.addressCountry,
                    "Registration is not available in the selected country."
                );
                return true;
            }
        );
    } finally {
        User.findOne = originalFindOne;
    }
});

test("registration sends thank-you email only after successful user creation", async () => {
    const originalFindOne = User.findOne;
    const originalCreate = User.create;
    const originalIssueTokensAndSession = authService.issueTokensAndSession;
    const originalSendRegistrationThankYouEmail = mailService.sendRegistrationThankYouEmail;

    let emailTriggered = false;

    try {
        User.findOne = (async () => null) as typeof User.findOne;
        User.create = (async (payload: Record<string, unknown>) => ({
            _id: { toString: () => "user_1" },
            email: payload.email,
            role: "user",
            firstName: payload.firstName,
        })) as typeof User.create;
        authService.issueTokensAndSession = (async () => ({
            accessToken: "access",
            refreshToken: "refresh",
            session: {},
        })) as typeof authService.issueTokensAndSession;
        mailService.sendRegistrationThankYouEmail = (async () => {
            emailTriggered = true;
        }) as typeof mailService.sendRegistrationThankYouEmail;

        await authService.register(validRegistration);

        assert.equal(emailTriggered, true);
    } finally {
        User.findOne = originalFindOne;
        User.create = originalCreate;
        authService.issueTokensAndSession = originalIssueTokensAndSession;
        mailService.sendRegistrationThankYouEmail = originalSendRegistrationThankYouEmail;
    }
});

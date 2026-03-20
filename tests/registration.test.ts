import test from "node:test";
import assert from "node:assert/strict";

import {
    COUNTRY_OPTIONS,
    assertValidRegistration,
    isBlockedCountry,
    validateRegistration,
} from "../src/shared/registration";

const validPayload = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    password: "supersecret",
    confirmPassword: "supersecret",
    phoneNumber: "+1 202 555 0123",
    street: "123 Main Street",
    city: "New York",
    country: "US",
    postCode: "10001",
    dateOfBirth: "1990-01-15",
    terms: true,
};

test("signup country options exclude blocked countries", () => {
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "RU"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "BY"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "IR"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "KP"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "SD"), false);
});

test("frontend/backend registration validation accepts a valid adult payload", () => {
    assert.deepEqual(validateRegistration(validPayload, { requireTerms: true }), {});
    assert.equal(assertValidRegistration(validPayload).country, "United States");
});

test("registration validation rejects blocked countries", () => {
    const errors = validateRegistration(
        {
            ...validPayload,
            country: "RU",
        },
        { requireTerms: true }
    );

    assert.equal(isBlockedCountry("RU"), true);
    assert.equal(errors.country, "Registration is not available in the selected country.");
    assert.throws(() => assertValidRegistration({ ...validPayload, country: "Russia" }));
});

test("registration validation rejects underage users", () => {
    const errors = validateRegistration(
        {
            ...validPayload,
            dateOfBirth: "2010-01-01",
        },
        { requireTerms: true }
    );

    assert.equal(errors.dateOfBirth, "You must be at least 18 years old.");
});

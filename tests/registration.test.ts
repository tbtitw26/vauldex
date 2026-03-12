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
    phone: "+1 202 555 0123",
    addressStreet: "123 Main Street",
    addressCity: "New York",
    addressCountry: "US",
    addressPostalCode: "10001",
    birthDate: "1990-01-15",
    terms: true,
};

test("signup country options exclude blocked countries", () => {
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "RU"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "BY"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "IR"), false);
    assert.equal(COUNTRY_OPTIONS.some((country) => country.code === "KP"), false);
});

test("frontend/backend registration validation accepts a valid adult payload", () => {
    assert.deepEqual(validateRegistration(validPayload, { requireTerms: true }), {});
    assert.equal(assertValidRegistration(validPayload).addressCountry, "United States");
});

test("registration validation rejects blocked countries", () => {
    const errors = validateRegistration(
        {
            ...validPayload,
            addressCountry: "RU",
        },
        { requireTerms: true }
    );

    assert.equal(isBlockedCountry("RU"), true);
    assert.equal(errors.addressCountry, "Registration is not available in the selected country.");
    assert.throws(() => assertValidRegistration({ ...validPayload, addressCountry: "Russia" }));
});

test("registration validation rejects underage users", () => {
    const errors = validateRegistration(
        {
            ...validPayload,
            birthDate: "2010-01-01",
        },
        { requireTerms: true }
    );

    assert.equal(errors.birthDate, "You must be at least 18 years old.");
});

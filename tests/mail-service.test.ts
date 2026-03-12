import test from "node:test";
import assert from "node:assert/strict";

import {
    buildOrderConfirmationEmail,
    buildRegistrationThankYouEmail,
} from "../src/backend/services/mail.service";

test("registration thank-you email is personalized", () => {
    const email = buildRegistrationThankYouEmail({ firstName: "Jane" });

    assert.match(email.subject, /Thanks for registering/i);
    assert.match(email.text, /Hi Jane,/);
    assert.match(email.html, /Jane/);
});

test("order confirmation email includes final successful order details", () => {
    const email = buildOrderConfirmationEmail({
        email: "jane@example.com",
        firstName: "Jane",
        orderId: "order_123",
        orderType: "cv",
        productName: "CV standard review",
        tokensDeducted: 30,
        orderDate: new Date("2026-03-12T10:00:00.000Z"),
        details: [
            { label: "Status", value: "ready" },
            { label: "Extras", value: "None" },
        ],
    });

    assert.match(email.text, /tokens were deducted successfully/i);
    assert.match(email.text, /order_123/);
    assert.match(email.text, /30/);
    assert.match(email.html, /CV standard review/);
    assert.match(email.html, /Status/);
});

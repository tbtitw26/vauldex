import { ENV } from "@/backend/config/env";
import {
    MailConfigError,
    MailRecipientError,
    sendEmail,
    validateMailConfigurationForOperation,
} from "@/backend/utils/sendEmail";

type ContactPayload = {
    name: string;
    secondName: string;
    email: string;
    phone: string;
    message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ContactValidationError extends Error {
    status = 400;

    constructor(message: string) {
        super(message);
        this.name = "ContactValidationError";
    }
}

function escapeHtml(value: string) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeText(value: unknown) {
    return String(value || "").trim();
}

function normalizeMessage(value: unknown) {
    return String(value || "").trim().slice(0, 5000);
}

function normalizeEmail(value: unknown) {
    const normalized = String(value || "").trim().toLowerCase();

    if (!normalized) {
        throw new ContactValidationError("Email is required");
    }

    if (!EMAIL_RE.test(normalized)) {
        throw new ContactValidationError("Email must be a valid email address");
    }

    return normalized;
}

function resolveContactRecipient() {
    const recipient = String(
        ENV.CONTACT_RECEIVER_EMAIL || ENV.SUPPORT_EMAIL || ""
    )
        .trim()
        .toLowerCase();

    if (!recipient) {
        throw new MailConfigError(
            "Contact recipient is not configured. Set CONTACT_RECEIVER_EMAIL or SUPPORT_EMAIL."
        );
    }

    if (!EMAIL_RE.test(recipient)) {
        throw new MailRecipientError(
            "Contact recipient email is invalid. Check CONTACT_RECEIVER_EMAIL or SUPPORT_EMAIL."
        );
    }

    return recipient;
}

function buildContactEmail(data: ContactPayload) {
    const messageText = data.message || "(none)";
    const safeMessageHtml = messageText
        .split(/\r?\n/)
        .map((line) => escapeHtml(line) || "&nbsp;")
        .join("<br/>");

    return {
        subject: "Contact form request",
        text: [
            "Contact form request",
            "",
            `First name: ${data.name}`,
            `Last name: ${data.secondName}`,
            `Email: ${data.email}`,
            `Phone: ${data.phone}`,
            `Message: ${messageText}`,
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2>Contact form request</h2>
                <p><strong>First name:</strong> ${escapeHtml(data.name)}</p>
                <p><strong>Last name:</strong> ${escapeHtml(data.secondName)}</p>
                <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
                <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
                <p><strong>Message:</strong><br/>${safeMessageHtml}</p>
            </div>
        `,
    };
}

function validatePayload(data: ContactPayload) {
    const name = normalizeText(data?.name);
    const secondName = normalizeText(data?.secondName);
    const email = normalizeEmail(data?.email);
    const phone = normalizeText(data?.phone);
    const message = normalizeMessage(data?.message);

    if (!name) {
        throw new ContactValidationError("First name is required");
    }

    if (!secondName) {
        throw new ContactValidationError("Second name is required");
    }

    if (!phone) {
        throw new ContactValidationError("Phone number is required");
    }

    return {
        name,
        secondName,
        email,
        phone,
        message,
    };
}

export const contactService = {
    async sendContact(data: ContactPayload) {
        const normalized = validatePayload(data);
        const recipient = resolveContactRecipient();
        validateMailConfigurationForOperation("contact");
        const message = buildContactEmail(normalized);

        console.info("[contact] send attempt", {
            recipient,
            senderEmail: normalized.email,
        });

        await sendEmail(recipient, message.subject, message.text, message.html, {
            operation: "contact",
        });

        console.info("[contact] send success", {
            recipient,
            senderEmail: normalized.email,
        });

        return { message: "Contact request sent" };
    },
};

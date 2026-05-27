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

function contactInfoRow(label: string, value: string) {
    return `
        <tr>
            <td style="padding:10px 16px;color:#6B7280;font-size:14px;border-bottom:1px solid #F3F4F6;white-space:nowrap;width:120px;">${escapeHtml(label)}</td>
            <td style="padding:10px 16px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #F3F4F6;">${escapeHtml(value)}</td>
        </tr>`;
}

function buildContactEmail(data: ContactPayload) {
    const messageText = data.message || "(none)";
    const safeMessageHtml = messageText
        .split(/\r?\n/)
        .map((line) => escapeHtml(line) || "&nbsp;")
        .join("<br/>");

    const companyName = escapeHtml(ENV.COMPANY_NAME);
    const year = new Date().getFullYear();

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
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
<tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr>
            <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:28px 40px;text-align:center;">
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">📬 New Contact Request</div>
            </td>
        </tr>
        <tr>
            <td style="padding:32px 40px 16px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;">
                <table role="presentation" style="width:100%;border-collapse:collapse;background:#F9FAFB;border-radius:8px;overflow:hidden;">
                    ${contactInfoRow("First name", data.name)}
                    ${contactInfoRow("Last name", data.secondName)}
                    ${contactInfoRow("Email", data.email)}
                    ${contactInfoRow("Phone", data.phone)}
                </table>
                <div style="margin-top:24px;">
                    <div style="font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Message</div>
                    <div style="background:#F9FAFB;border-radius:8px;padding:16px 20px;font-size:14px;line-height:1.7;color:#374151;border-left:4px solid #2563EB;">
                        ${safeMessageHtml}
                    </div>
                </div>
            </td>
        </tr>
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #E5E7EB;"></div></td></tr>
        <tr>
            <td style="padding:20px 40px 28px;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9CA3AF;">
                &copy; ${year} ${companyName}. All rights reserved.
            </td>
        </tr>
    </table>
</td></tr>
</table>
</body>
</html>`,
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

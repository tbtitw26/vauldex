import { Resend } from "resend";
import nodemailer from "nodemailer";
import { ENV } from "../config/env";

type EmailProvider = "resend" | "smtp";

type SendEmailOptions = {
    operation: "registration" | "contact" | "order" | "payment" | "generic";
};

type MailConfiguration = {
    provider: EmailProvider;
    from: string;
    senderEmail: string;
    smtpSecure?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function maskError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
        };
    }

    return { message: String(error) };
}

function normalizeEmailAddress(email: string, fieldName: string) {
    const normalized = String(email || "").trim().toLowerCase();

    if (!normalized) {
        throw new MailRecipientError(`${fieldName} is required.`);
    }

    if (!EMAIL_RE.test(normalized)) {
        throw new MailRecipientError(`${fieldName} must be a valid email address.`);
    }

    return normalized;
}

function normalizeConfiguredEmailAddress(email: string, fieldName: string) {
    const normalized = String(email || "").trim().toLowerCase();

    if (!normalized) {
        throw new MailConfigError(`${fieldName} is required.`);
    }

    if (!EMAIL_RE.test(normalized)) {
        throw new MailConfigError(`${fieldName} must be a valid email address.`);
    }

    return normalized;
}

function sanitizeHeaderValue(value: string) {
    return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function buildFromValue(senderEmail: string) {
    const senderName = sanitizeHeaderValue(ENV.EMAIL_FROM_NAME);

    return senderName ? `${senderName} <${senderEmail}>` : senderEmail;
}

function describeMissingVars(vars: string[]) {
    return vars.join(", ");
}

function getConfiguredSmtpFields() {
    const pairs = [
        ["SMTP_HOST", ENV.SMTP_HOST],
        ["SMTP_PORT", ENV.SMTP_PORT],
        ["SMTP_USER", ENV.SMTP_USER],
        ["SMTP_PASS", ENV.SMTP_PASS],
    ] as const;

    return {
        any: pairs.some(([, value]) => Boolean(String(value || "").trim())) || typeof ENV.SMTP_SECURE === "boolean",
        missing: pairs
            .filter(([, value]) => !String(value || "").trim())
            .map(([name]) => name)
            .concat(typeof ENV.SMTP_SECURE === "boolean" ? [] : ["SMTP_SECURE"]),
    };
}

function resolveMailConfiguration(): MailConfiguration {
    const resendConfigured = Boolean(ENV.RESEND_API.trim());
    const smtpState = getConfiguredSmtpFields();

    if (resendConfigured) {
        const senderEmail = normalizeConfiguredEmailAddress(
            ENV.EMAIL_FROM,
            "EMAIL_FROM for Resend"
        );

        return {
            provider: "resend",
            from: buildFromValue(senderEmail),
            senderEmail,
        };
    }

    if (smtpState.any) {
        if (smtpState.missing.length > 0) {
            throw new MailConfigError(
                `SMTP fallback is partially configured. Missing: ${describeMissingVars(smtpState.missing)}.`
            );
        }

        const senderEmail = normalizeConfiguredEmailAddress(
            ENV.EMAIL_FROM || ENV.SMTP_USER,
            ENV.EMAIL_FROM ? "EMAIL_FROM" : "SMTP_USER"
        );

        return {
            provider: "smtp",
            from: buildFromValue(senderEmail),
            senderEmail,
            smtpSecure: ENV.SMTP_SECURE,
        };
    }

    throw new MailConfigError(
        "No email transport is configured. Set RESEND_API and EMAIL_FROM for Resend, or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, and EMAIL_FROM/SMTP_USER for SMTP."
    );
}

function getResendClient() {
    if (!ENV.RESEND_API.trim()) return null;
    return new Resend(ENV.RESEND_API);
}

function getSmtpTransport() {
    const smtpConfig = resolveMailConfiguration();
    if (smtpConfig.provider !== "smtp") return null;

    return nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: Number(ENV.SMTP_PORT),
        secure: smtpConfig.smtpSecure,
        auth: {
            user: ENV.SMTP_USER,
            pass: ENV.SMTP_PASS,
        },
    });
}

export class MailConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MailConfigError";
    }
}

export class MailRecipientError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MailRecipientError";
    }
}

export class MailDeliveryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MailDeliveryError";
    }
}

export function getMailDiagnostics() {
    try {
        const config = resolveMailConfiguration();

        return {
            ok: true,
            provider: config.provider,
            senderEmail: config.senderEmail,
            resendConfigured: Boolean(ENV.RESEND_API.trim()),
            smtpConfigured: getConfiguredSmtpFields().missing.length === 0,
            contactRecipient: ENV.CONTACT_RECEIVER_EMAIL || ENV.SUPPORT_EMAIL || "",
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            resendConfigured: Boolean(ENV.RESEND_API.trim()),
            smtpConfigured: getConfiguredSmtpFields().missing.length === 0,
            contactRecipient: ENV.CONTACT_RECEIVER_EMAIL || ENV.SUPPORT_EMAIL || "",
        };
    }
}

export function validateMailConfigurationForOperation(
    operation: SendEmailOptions["operation"]
) {
    const diagnostics = getMailDiagnostics();

    if (!diagnostics.ok) {
        throw new MailConfigError(`[mail:${operation}] ${diagnostics.error}`);
    }

    return diagnostics;
}

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    options: SendEmailOptions = { operation: "generic" }
) {
    const mailConfig = resolveMailConfiguration();
    const resend = mailConfig.provider === "resend" ? getResendClient() : null;
    const smtpTransport = mailConfig.provider === "smtp" ? getSmtpTransport() : null;
    const recipient = normalizeEmailAddress(to, "Recipient email");
    const normalizedSubject = sanitizeHeaderValue(subject) || "Notification";
    const finalText = typeof text === "string" ? text : "";
    const finalHtml = html || defaultTemplate(normalizedSubject, finalText);

    console.info("[mail] send attempt", {
        operation: options.operation,
        provider: mailConfig.provider,
        from: mailConfig.senderEmail,
        to: recipient,
        subject: normalizedSubject,
    });

    if (mailConfig.provider === "resend" && resend) {
        try {
            const response = await resend.emails.send({
                from: mailConfig.from,
                to: recipient,
                subject: normalizedSubject,
                text: finalText,
                html: finalHtml,
            });

            if ((response as any)?.error) {
                const providerError =
                    typeof (response as any).error === "string"
                        ? (response as any).error
                        : JSON.stringify((response as any).error);

                console.error("[mail] delivery failed", {
                    operation: options.operation,
                    provider: mailConfig.provider,
                    from: mailConfig.senderEmail,
                    to: recipient,
                    subject: normalizedSubject,
                    error: providerError,
                });

                throw new MailDeliveryError(
                    `Resend rejected the email. Check EMAIL_FROM/domain verification and provider logs. Provider error: ${providerError}`
                );
            }

            console.info("[mail] send success", {
                operation: options.operation,
                provider: mailConfig.provider,
                from: mailConfig.senderEmail,
                to: recipient,
                subject: normalizedSubject,
                id: (response as any)?.data?.id || (response as any)?.id || null,
            });

            return response;
        } catch (error) {
            if (error instanceof MailDeliveryError) throw error;

            console.error("[mail] delivery failed", {
                operation: options.operation,
                provider: mailConfig.provider,
                from: mailConfig.senderEmail,
                to: recipient,
                subject: normalizedSubject,
                error: maskError(error),
            });

            throw new MailDeliveryError(
                `Resend delivery failed. Check RESEND_API, EMAIL_FROM/domain verification, and provider logs. ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    if (mailConfig.provider === "smtp" && smtpTransport) {
        try {
            const response = await smtpTransport.sendMail({
                from: mailConfig.from,
                to: recipient,
                subject: normalizedSubject,
                text: finalText,
                html: finalHtml,
            });

            console.info("[mail] send success", {
                operation: options.operation,
                provider: mailConfig.provider,
                from: mailConfig.senderEmail,
                to: recipient,
                subject: normalizedSubject,
                messageId: response.messageId,
                accepted: response.accepted,
                rejected: response.rejected,
            });

            return response;
        } catch (error) {
            console.error("[mail] delivery failed", {
                operation: options.operation,
                provider: mailConfig.provider,
                from: mailConfig.senderEmail,
                to: recipient,
                subject: normalizedSubject,
                error: maskError(error),
            });

            throw new MailDeliveryError(
                `SMTP delivery failed. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, EMAIL_FROM, and provider/server logs. ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    throw new MailConfigError("Resolved mail provider could not be initialized.");
}

function defaultTemplate(title: string, message: string) {
    const appUrl = ENV.APP_URL;
    const logoUrl = `${appUrl}/logo.png`;
    const companyName = escapeHtml(ENV.COMPANY_NAME);
    const websiteName = escapeHtml(ENV.WEBSITE_NAME);
    const supportEmail = ENV.SUPPORT_EMAIL;
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${companyName}</title></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
<tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr>
            <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:32px 40px;text-align:center;">
                <img src="${logoUrl}" alt="${companyName}" width="48" height="48" style="display:inline-block;width:48px;height:48px;border-radius:10px;margin-bottom:12px;" />
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${companyName}</div>
            </td>
        </tr>
        <tr>
            <td style="padding:36px 40px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 24px;white-space:pre-line;color:#374151;font-size:15px;">${escapeHtml(message)}</p>
                <div style="text-align:center;margin:32px 0 8px;">
                    <a href="${appUrl}" style="display:inline-block;background:#1E3A8A;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                        Open ${websiteName}
                    </a>
                </div>
            </td>
        </tr>
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #E5E7EB;"></div></td></tr>
        <tr>
            <td style="padding:24px 40px 32px;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9CA3AF;line-height:1.6;">
                <div>&copy; ${year} ${companyName}. All rights reserved.</div>
                <div style="margin-top:4px;">
                    <a href="${appUrl}" style="color:#2563EB;text-decoration:none;">${websiteName}</a>
                    ${supportEmail ? ` &middot; <a href="mailto:${supportEmail}" style="color:#2563EB;text-decoration:none;">${escapeHtml(supportEmail)}</a>` : ""}
                </div>
            </td>
        </tr>
    </table>
</td></tr>
</table>
</body>
</html>`;
}

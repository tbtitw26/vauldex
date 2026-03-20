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
    return `
    <div style="font-family: Arial, sans-serif; background:#f4faff; padding:20px; color:#333;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
        <h2 style="color:#007BFF; text-align:center; margin-bottom:24px;">${escapeHtml(title)}</h2>

        <p style="font-size:16px; line-height:1.6; color:#333; white-space:pre-line;">
          ${escapeHtml(message)}
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a
            href="${ENV.APP_URL}"
            style="background:#007BFF; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; display:inline-block;"
          >
            Open ${escapeHtml(ENV.WEBSITE_NAME)}
          </a>
        </div>

        <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

        <p style="font-size:14px; color:#777; text-align:center; margin:0;">
          © ${new Date().getFullYear()} ${escapeHtml(ENV.COMPANY_NAME)} - All rights reserved.
        </p>
      </div>
    </div>
  `;
}

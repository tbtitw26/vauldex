import { sendEmail } from "@/backend/utils/sendEmail";
import { ENV } from "@/backend/config/env";

type EmailTemplate = {
    subject: string;
    text: string;
    html: string;
};

type EmailDetail = {
    label: string;
    value: string;
};

type OrderConfirmationParams = {
    email: string;
    firstName?: string;
    orderId: string;
    orderType: string;
    productName: string;
    orderDate: Date;
    details?: EmailDetail[];
    tokensDeducted?: number;
    amountLabel?: string;
};

type PaymentConfirmationParams = {
    email: string;
    firstName?: string;
    tokensAdded: number;
    orderDate: Date;
    details?: EmailDetail[];
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(value);
}

function buildGreeting(firstName?: string) {
    return firstName?.trim() ? `Hi ${firstName.trim()},` : "Hello,";
}

function renderDetails(details: EmailDetail[] = []) {
    if (details.length === 0) return "";

    return details.map((detail) => `- ${detail.label}: ${detail.value}`).join("\n");
}

function renderDetailsHtml(details: EmailDetail[] = []) {
    if (details.length === 0) return "";

    return details
        .map(
            (d) => `
            <tr>
                <td style="padding:8px 12px;color:#6B7280;font-size:14px;white-space:nowrap;">${escapeHtml(d.label)}</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;">${escapeHtml(d.value)}</td>
            </tr>`
        )
        .join("");
}

function detailsTable(rows: string) {
    if (!rows) return "";
    return `
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${rows}
        </table>`;
}

function emailLayout(body: string, options?: { buttonText?: string; buttonUrl?: string }) {
    const appUrl = ENV.APP_URL;
    const logoUrl = `${appUrl}/logo.png`;
    const companyName = escapeHtml(ENV.COMPANY_NAME);
    const supportEmail = ENV.SUPPORT_EMAIL;
    const year = new Date().getFullYear();

    const buttonBlock =
        options?.buttonText && options?.buttonUrl
            ? `<div style="text-align:center;margin:32px 0 8px;">
                <a href="${options.buttonUrl}" style="display:inline-block;background:#1E3A8A;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;mso-padding-alt:14px 32px;">
                    ${escapeHtml(options.buttonText)}
                </a>
               </div>`
            : "";

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${companyName}</title></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6;">
<tr><td align="center" style="padding:32px 16px;">

    <!-- Container -->
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
            <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:32px 40px;text-align:center;">
                <img src="${logoUrl}" alt="${companyName}" width="48" height="48" style="display:inline-block;width:48px;height:48px;border-radius:10px;margin-bottom:12px;" />
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${companyName}</div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding:36px 40px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;">
                ${body}
                ${buttonBlock}
            </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #E5E7EB;"></div></td></tr>

        <!-- Footer -->
        <tr>
            <td style="padding:24px 40px 32px;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9CA3AF;line-height:1.6;">
                <div>&copy; ${year} ${companyName}. All rights reserved.</div>
                <div style="margin-top:4px;">
                    <a href="${appUrl}" style="color:#2563EB;text-decoration:none;">${escapeHtml(ENV.WEBSITE_NAME)}</a>
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

function infoRow(label: string, value: string) {
    return `
        <tr>
            <td style="padding:10px 16px;color:#6B7280;font-size:14px;border-bottom:1px solid #F3F4F6;white-space:nowrap;width:140px;">${escapeHtml(label)}</td>
            <td style="padding:10px 16px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #F3F4F6;">${escapeHtml(value)}</td>
        </tr>`;
}

function infoTable(rows: string) {
    return `
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;background:#F9FAFB;border-radius:8px;overflow:hidden;">
            ${rows}
        </table>`;
}

export function buildRegistrationThankYouEmail(params: { firstName?: string }): EmailTemplate {
    const greeting = buildGreeting(params.firstName);
    const firstName = params.firstName?.trim() || "";
    const welcomeName = firstName ? ` ${firstName}` : "";

    return {
        subject: "Thanks for registering",
        text: `${greeting}

Your account has been created successfully. You can now sign in and start using the service.`,
        html: emailLayout(
            `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Welcome${welcomeName}! 🎉</h1>
             <p style="margin:0 0 20px;color:#6B7280;font-size:15px;">Your account has been created successfully.</p>
             <div style="background:#EFF6FF;border-left:4px solid #2563EB;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
                 <p style="margin:0;color:#1E3A8A;font-size:14px;font-weight:600;">You're all set!</p>
                 <p style="margin:4px 0 0;color:#374151;font-size:14px;">Sign in and start exploring our services. Your account is ready to go.</p>
             </div>`,
            { buttonText: "Get Started", buttonUrl: ENV.APP_URL }
        ),
    };
}

export function buildOrderConfirmationEmail(params: OrderConfirmationParams): EmailTemplate {
    const greeting = buildGreeting(params.firstName);
    const transactionDate = formatDate(params.orderDate);
    const tokenLine =
        typeof params.tokensDeducted === "number"
            ? `Your ${params.tokensDeducted} tokens were deducted successfully.`
            : "";
    const amountLine = params.amountLabel ? `Amount: ${params.amountLabel}` : "";
    const detailLines = renderDetails(params.details);

    let tableRows = "";
    tableRows += infoRow("Order ID", params.orderId);
    tableRows += infoRow("Order type", params.orderType);
    tableRows += infoRow("Date", transactionDate);
    if (typeof params.tokensDeducted === "number") {
        tableRows += infoRow("Tokens used", String(params.tokensDeducted));
    }
    if (params.amountLabel) {
        tableRows += infoRow("Amount", params.amountLabel);
    }
    tableRows += renderDetailsHtml(params.details);

    return {
        subject: `${params.productName} confirmation`,
        text: `${greeting}

Your ${params.productName} has been completed successfully.
Order ID: ${params.orderId}
Order type: ${params.orderType}
Transaction date: ${transactionDate}
${tokenLine}
${amountLine}
${detailLines}`.trim(),
        html: emailLayout(
            `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Order Confirmed ✅</h1>
             <p style="margin:0 0 4px;color:#6B7280;font-size:15px;">${escapeHtml(greeting)}</p>
             <p style="margin:0 0 20px;color:#374151;font-size:15px;">Your <strong>${escapeHtml(params.productName)}</strong> has been completed successfully.</p>
             ${infoTable(tableRows)}`,
            { buttonText: "View Dashboard", buttonUrl: ENV.APP_URL }
        ),
    };
}

export function buildPaymentConfirmationEmail(params: PaymentConfirmationParams): EmailTemplate {
    const greeting = buildGreeting(params.firstName);
    const transactionDate = formatDate(params.orderDate);
    const detailLines = renderDetails(params.details);

    let tableRows = "";
    tableRows += infoRow("Tokens added", String(params.tokensAdded));
    tableRows += infoRow("Date", transactionDate);
    tableRows += renderDetailsHtml(params.details);

    return {
        subject: "Token purchase confirmation",
        text: `${greeting}

Your payment was processed successfully.
Tokens added: ${params.tokensAdded}
Transaction date: ${transactionDate}
${detailLines}`.trim(),
        html: emailLayout(
            `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Payment Successful 💳</h1>
             <p style="margin:0 0 4px;color:#6B7280;font-size:15px;">${escapeHtml(greeting)}</p>
             <p style="margin:0 0 20px;color:#374151;font-size:15px;">Your payment was processed successfully and tokens have been added to your account.</p>
             <div style="background:#ECFDF5;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                 <div style="font-size:36px;font-weight:800;color:#059669;">+${params.tokensAdded}</div>
                 <div style="font-size:13px;color:#6B7280;margin-top:4px;">tokens added to your balance</div>
             </div>
             ${infoTable(tableRows)}`,
            { buttonText: "View Balance", buttonUrl: ENV.APP_URL }
        ),
    };
}

export const mailService = {
    async sendRegistrationThankYouEmail(params: { email: string; firstName?: string }) {
        const template = buildRegistrationThankYouEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html, {
            operation: "registration",
        });
    },

    async sendOrderConfirmationEmail(params: OrderConfirmationParams) {
        const template = buildOrderConfirmationEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html, {
            operation: "order",
        });
    },

    async sendPaymentConfirmationEmail(params: PaymentConfirmationParams) {
        const template = buildPaymentConfirmationEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html, {
            operation: "payment",
        });
    },
};

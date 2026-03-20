import { sendEmail } from "@/backend/utils/sendEmail";

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

    return `
        <ul style="margin:16px 0;padding-left:20px;">
            ${details
                .map(
                    (detail) =>
                        `<li><strong>${escapeHtml(detail.label)}:</strong> ${escapeHtml(detail.value)}</li>`
                )
                .join("")}
        </ul>
    `;
}

export function buildRegistrationThankYouEmail(params: { firstName?: string }): EmailTemplate {
    const greeting = buildGreeting(params.firstName);

    return {
        subject: "Thanks for registering",
        text: `${greeting}

Your account has been created successfully. You can now sign in and start using the service.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
                <p>${escapeHtml(greeting)}</p>
                <p>Your account has been created successfully. You can now sign in and start using the service.</p>
            </div>
        `,
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
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
                <p>${escapeHtml(greeting)}</p>
                <p>Your <strong>${escapeHtml(params.productName)}</strong> has been completed successfully.</p>
                <p><strong>Order ID:</strong> ${escapeHtml(params.orderId)}</p>
                <p><strong>Order type:</strong> ${escapeHtml(params.orderType)}</p>
                <p><strong>Transaction date:</strong> ${escapeHtml(transactionDate)}</p>
                ${
                    typeof params.tokensDeducted === "number"
                        ? `<p><strong>Tokens used:</strong> ${params.tokensDeducted}</p>`
                        : ""
                }
                ${params.amountLabel ? `<p><strong>Amount:</strong> ${escapeHtml(params.amountLabel)}</p>` : ""}
                ${renderDetailsHtml(params.details)}
            </div>
        `,
    };
}

export function buildPaymentConfirmationEmail(params: PaymentConfirmationParams): EmailTemplate {
    const greeting = buildGreeting(params.firstName);
    const transactionDate = formatDate(params.orderDate);
    const detailLines = renderDetails(params.details);

    return {
        subject: "Token purchase confirmation",
        text: `${greeting}

Your payment was processed successfully.
Tokens added: ${params.tokensAdded}
Transaction date: ${transactionDate}
${detailLines}`.trim(),
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
                <p>${escapeHtml(greeting)}</p>
                <p>Your payment was processed successfully.</p>
                <p><strong>Tokens added:</strong> ${params.tokensAdded}</p>
                <p><strong>Transaction date:</strong> ${escapeHtml(transactionDate)}</p>
                ${renderDetailsHtml(params.details)}
            </div>
        `,
    };
}

export const mailService = {
    async sendRegistrationThankYouEmail(params: { email: string; firstName?: string }) {
        const template = buildRegistrationThankYouEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html);
    },

    async sendOrderConfirmationEmail(params: OrderConfirmationParams) {
        const template = buildOrderConfirmationEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html);
    },

    async sendPaymentConfirmationEmail(params: PaymentConfirmationParams) {
        const template = buildPaymentConfirmationEmail(params);
        return sendEmail(params.email, template.subject, template.text, template.html);
    },
};

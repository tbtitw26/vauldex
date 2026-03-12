import { ENV } from "../config/env";
import { sendEmail } from "../utils/sendEmail";

type RegistrationThankYouEmailInput = {
    email: string;
    firstName?: string;
};

type OrderConfirmationEmailInput = {
    email: string;
    firstName?: string;
    orderId: string;
    orderType: "cv" | "ai";
    productName: string;
    tokensDeducted: number;
    orderDate: Date;
    details: Array<{ label: string; value: string }>;
};

function escapeHtml(value: string) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function greeting(firstName?: string) {
    return firstName?.trim() ? `Hi ${firstName.trim()},` : "Hello,";
}

function baseHtmlTemplate(title: string, body: string) {
    const contactBlock =
        ENV.SUPPORT_EMAIL || ENV.COMPANY_PHONE || ENV.COMPANY_ADDRESS
            ? `
        <div style="margin-top:24px; padding:16px; background:#f8fbff; border-radius:8px;">
            <p style="margin:0 0 10px; font-size:14px; font-weight:bold;">Contact details</p>
            ${
                ENV.SUPPORT_EMAIL
                    ? `<p style="margin:4px 0; font-size:14px;">Email: ${escapeHtml(ENV.SUPPORT_EMAIL)}</p>`
                    : ""
            }
            ${
                ENV.COMPANY_PHONE
                    ? `<p style="margin:4px 0; font-size:14px;">Phone: ${escapeHtml(ENV.COMPANY_PHONE)}</p>`
                    : ""
            }
            ${
                ENV.COMPANY_ADDRESS
                    ? `<p style="margin:4px 0; font-size:14px;">Address: ${escapeHtml(ENV.COMPANY_ADDRESS)}</p>`
                    : ""
            }
        </div>
        `
            : "";

    return `
        <div style="font-family: Arial, sans-serif; background:#f4faff; padding:20px; color:#333;">
            <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                <h2 style="color:#007BFF; text-align:center; margin-bottom:24px;">
                    ${escapeHtml(title)}
                </h2>

                ${body}

                ${contactBlock}

                <div style="text-align:center; margin:30px 0;">
                    <a
                        href="${ENV.WEBSITE_URL}"
                        style="display:inline-block; background:#007BFF; color:#fff; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:bold;"
                    >
                        Open ${escapeHtml(ENV.WEBSITE_NAME)}
                    </a>
                </div>

                <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

                <p style="font-size:14px; color:#777; text-align:center; margin:0;">
                    © ${new Date().getFullYear()} ${escapeHtml(ENV.COMPANY_NAME)} – All rights reserved.
                </p>
            </div>
        </div>
    `;
}

function orderDetailsList(details: Array<{ label: string; value: string }>) {
    const rows = details
        .filter((item) => item.value)
        .map(
            (item) => `
                <tr>
                    <td style="padding:8px 12px; border-bottom:1px solid #e5e7eb; font-weight:600;">
                        ${escapeHtml(item.label)}
                    </td>
                    <td style="padding:8px 12px; border-bottom:1px solid #e5e7eb;">
                        ${escapeHtml(item.value)}
                    </td>
                </tr>
            `
        )
        .join("");

    return `
        <table style="width:100%; border-collapse:collapse; margin-top:18px; font-size:14px;">
            ${rows}
        </table>
    `;
}

export function buildRegistrationThankYouEmail({
                                                   firstName,
                                               }: {
    firstName?: string;
}) {
    const subject = `Welcome to ${ENV.WEBSITE_NAME} 🎉`;

    const text = [
        greeting(firstName),
        "",
        `Thank you for registering at ${ENV.WEBSITE_NAME}.`,
        "Your account has been successfully created.",
        "",
        "You can now sign in and start using the platform.",
        "",
        ENV.SUPPORT_EMAIL ? `Support email: ${ENV.SUPPORT_EMAIL}` : "",
        ENV.COMPANY_PHONE ? `Phone: ${ENV.COMPANY_PHONE}` : "",
        ENV.COMPANY_ADDRESS ? `Address: ${ENV.COMPANY_ADDRESS}` : "",
        "",
        `Open ${ENV.WEBSITE_NAME}: ${ENV.WEBSITE_URL}`,
    ]
        .filter(Boolean)
        .join("\n");

    const html = baseHtmlTemplate(
        `Welcome to ${ENV.WEBSITE_NAME} 🎉`,
        `
        <p style="font-size:16px; line-height:1.6;">
            ${escapeHtml(greeting(firstName))}
        </p>

        <p style="font-size:16px; line-height:1.6;">
            Thank you for registering at <strong>${escapeHtml(ENV.WEBSITE_NAME)}</strong>.
            Your account has been successfully created.
        </p>

        <p style="font-size:16px; line-height:1.6;">
            You can now sign in and start using the platform.
        </p>
        `
    );

    return { subject, text, html };
}

export function buildOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
    const finalDetails = [
        { label: "Order reference", value: input.orderId },
        { label: "Order type", value: input.orderType.toUpperCase() },
        { label: "Product", value: input.productName },
        { label: "Tokens deducted", value: String(input.tokensDeducted) },
        { label: "Order date", value: input.orderDate.toISOString() },
        { label: "Account email", value: input.email },
        ...input.details,
    ];

    const subject = `${ENV.WEBSITE_NAME} order confirmation`;

    const text = [
        greeting(input.firstName),
        "",
        "Your order was received successfully and tokens were deducted successfully.",
        "",
        ...finalDetails.map((detail) => `${detail.label}: ${detail.value}`),
    ].join("\n");

    const html = baseHtmlTemplate(
        subject,
        `
        <p style="margin:0; font-size:15px; line-height:1.7;">
            ${escapeHtml(greeting(input.firstName))} Your order was received successfully and the token deduction has been completed.
        </p>
        ${orderDetailsList(finalDetails)}
        `
    );

    return { subject, text, html };
}

async function safeSendEmail(
    context: string,
    to: string,
    subject: string,
    text: string,
    html: string
) {
    try {
        return await sendEmail(to, subject, text, html);
    } catch (error) {
        console.error(`[mailService.${context}] Failed to send email`, error);
        throw error;
    }
}

export const mailService = {
    async sendRegistrationThankYouEmail({
                                            email,
                                            firstName,
                                        }: RegistrationThankYouEmailInput) {
        const { subject, text, html } = buildRegistrationThankYouEmail({
            firstName,
        });

        return await safeSendEmail(
            "sendRegistrationThankYouEmail",
            email,
            subject,
            text,
            html
        );
    },

    async sendOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
        const { subject, text, html } = buildOrderConfirmationEmail(input);

        return await safeSendEmail(
            "sendOrderConfirmationEmail",
            input.email,
            subject,
            text,
            html
        );
    },
};
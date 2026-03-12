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

function greeting(firstName?: string) {
    return firstName?.trim() ? `Hi ${firstName.trim()},` : "Hello,";
}

function baseHtmlTemplate(title: string, intro: string, body: string) {
    const supportLine = ENV.SUPPORT_EMAIL
        ? `Need help? Contact us at <a href="mailto:${ENV.SUPPORT_EMAIL}" style="color:#0f5bd8;">${ENV.SUPPORT_EMAIL}</a>.`
        : "";
    const companyDetails = [ENV.COMPANY_ADDRESS, ENV.COMPANY_PHONE].filter(Boolean).join(" | ");

    return `
        <div style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial, sans-serif; color:#18202a;">
            <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dde5ee; border-radius:16px; overflow:hidden;">
                <div style="padding:24px 28px; background:#0f172a; color:#ffffff;">
                    <p style="margin:0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">${ENV.WEBSITE_NAME}</p>
                    <h1 style="margin:10px 0 0; font-size:26px; line-height:1.2;">${title}</h1>
                </div>
                <div style="padding:28px;">
                    <p style="margin:0 0 16px; font-size:16px; line-height:1.6;">${intro}</p>
                    ${body}
                    <p style="margin:24px 0 0; font-size:14px; line-height:1.6; color:#526071;">${supportLine}</p>
                </div>
                <div style="padding:18px 28px; background:#f8fafc; border-top:1px solid #dde5ee; font-size:13px; color:#526071;">
                    <div>${ENV.COMPANY_NAME}</div>
                    <div style="margin-top:4px;">${companyDetails}</div>
                    <div style="margin-top:4px;"><a href="${ENV.WEBSITE_URL}" style="color:#0f5bd8;">${ENV.WEBSITE_URL}</a></div>
                </div>
            </div>
        </div>
    `;
}

function orderDetailsList(details: Array<{ label: string; value: string }>) {
    const rows = details
        .filter((item) => item.value)
        .map(
            (item) =>
                `<tr><td style="padding:8px 12px; border-bottom:1px solid #e5e7eb; font-weight:600;">${item.label}</td><td style="padding:8px 12px; border-bottom:1px solid #e5e7eb;">${item.value}</td></tr>`
        )
        .join("");

    return `<table style="width:100%; border-collapse:collapse; margin-top:18px; font-size:14px;">${rows}</table>`;
}

export function buildRegistrationThankYouEmail({
    firstName,
}: {
    firstName?: string;
}) {
    const subject = `Thanks for registering with ${ENV.WEBSITE_NAME}`;
    const text = [
        greeting(firstName),
        "",
        `Thank you for registering with ${ENV.WEBSITE_NAME}. Your account has been created successfully.`,
        ENV.SUPPORT_EMAIL ? `If you need help, contact us at ${ENV.SUPPORT_EMAIL}.` : "",
    ]
        .filter(Boolean)
        .join("\n");
    const html = baseHtmlTemplate(
        subject,
        `${greeting(firstName)} Thank you for registering with ${ENV.WEBSITE_NAME}.`,
        `<p style="margin:0; font-size:15px; line-height:1.7;">We appreciate your trust in ${ENV.COMPANY_NAME}. Your account is ready to use.</p>`
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
        ...finalDetails.map((detail) => `${detail.label}: ${detail.value}`),
    ].join("\n");
    const html = baseHtmlTemplate(
        subject,
        `${greeting(input.firstName)} Your order was received successfully and the token deduction has been completed.`,
        orderDetailsList(finalDetails)
    );

    return { subject, text, html };
}

async function safeSendEmail(context: string, to: string, subject: string, text: string, html: string) {
    try {
        await sendEmail(to, subject, text, html);
    } catch (error) {
        console.error(`[mailService.${context}] Failed to send email`, error);
    }
}

export const mailService = {
    async sendRegistrationThankYouEmail({ email, firstName }: RegistrationThankYouEmailInput) {
        const { subject, text, html } = buildRegistrationThankYouEmail({ firstName });

        await safeSendEmail("sendRegistrationThankYouEmail", email, subject, text, html);
    },

    async sendOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
        const { subject, text, html } = buildOrderConfirmationEmail(input);

        await safeSendEmail("sendOrderConfirmationEmail", input.email, subject, text, html);
    },
};

import { Resend } from "resend";
import nodemailer from "nodemailer";
import { ENV } from "../config/env";

const resend = ENV.RESEND_API ? new Resend(ENV.RESEND_API) : null;
const smtpTransport =
    ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS
        ? nodemailer.createTransport({
              host: ENV.SMTP_HOST,
              port: Number(ENV.SMTP_PORT),
              secure: ENV.SMTP_SECURE,
              auth: {
                  user: ENV.SMTP_USER,
                  pass: ENV.SMTP_PASS,
              },
          })
        : null;

function escapeHtml(value: string) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function buildFromValue() {
    const fromEmail = ENV.EMAIL_FROM || ENV.SMTP_USER || ENV.SUPPORT_EMAIL;

    if (!fromEmail) {
        throw new Error("A sender email is not configured");
    }

    return ENV.EMAIL_FROM_NAME
        ? `${ENV.EMAIL_FROM_NAME} <${fromEmail}>`
        : fromEmail;
}

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
) {
    const finalHtml = html || defaultTemplate(subject, text);

    if (resend) {
        try {
            const response = await resend.emails.send({
                from: buildFromValue(),
                to,
                subject,
                text: text || "",
                html: finalHtml,
            });

            console.log("✅ Email sent via Resend:", response);

            if ((response as any)?.error) {
                console.error("❌ Resend returned error:", (response as any).error);
                throw new Error(
                    typeof (response as any).error === "string"
                        ? (response as any).error
                        : JSON.stringify((response as any).error)
                );
            }

            return response;
        } catch (error) {
            console.error("❌ Resend email failed:", error);
            throw error;
        }
    }

    if (smtpTransport) {
        try {
            const response = await smtpTransport.sendMail({
                from: buildFromValue(),
                to,
                subject,
                text: text || "",
                html: finalHtml,
            });

            console.log("✅ Email sent via SMTP:", response.messageId);
            return response;
        } catch (error) {
            console.error("❌ SMTP email failed:", error);
            throw error;
        }
    }

    throw new Error("No email transport is configured");
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
          © ${new Date().getFullYear()} ${escapeHtml(ENV.COMPANY_NAME)} – All rights reserved.
        </p>
      </div>
    </div>
  `;
}

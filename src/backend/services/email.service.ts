import { sendEmail } from "../utils/sendEmail";
import {
    COMPANY_NAME,
    COMPANY_ADDRESS,
    COMPANY_PHONE,
    COMPANY_LEGAL_NAME,
    COMPANY_NUMBER,
    COMPANY_EMAIL,
} from "@/resources/constants";

export const emailService = {
    async sendWelcomeEmail(data: {
        email: string;
        firstName: string;
    }) {
        const companyName = COMPANY_NAME || "Website";

        const subject = `Welcome to ${companyName} 🎉`;

        const text = `
Hi ${data.firstName},

Thank you for registering at ${companyName}.
Your account has been successfully created.

You can now sign in and start using the platform.

${COMPANY_EMAIL ? `Support email: ${COMPANY_EMAIL}` : ""}
${COMPANY_PHONE ? `Phone: ${COMPANY_PHONE}` : ""}
${COMPANY_ADDRESS ? `Address: ${COMPANY_ADDRESS}` : ""}

Best regards,
${companyName} Team
        `.trim();

        const html = `
        <div style="font-family: Arial, sans-serif; background:#f4faff; padding:20px; color:#333;">
          <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            <h2 style="color:#007BFF; text-align:center; margin-bottom:24px;">
              Welcome to ${escapeHtml(companyName)} 🎉
            </h2>

            <p style="font-size:16px; line-height:1.6;">
              Hi <strong>${escapeHtml(data.firstName)}</strong>,
            </p>

            <p style="font-size:16px; line-height:1.6;">
              Thank you for registering at <strong>${escapeHtml(companyName)}</strong>.
              Your account has been successfully created.
            </p>

            <p style="font-size:16px; line-height:1.6;">
              You can now sign in and start using the platform.
            </p>

            ${
                COMPANY_EMAIL || COMPANY_PHONE || COMPANY_ADDRESS
                    ? `
            <div style="margin-top:24px; padding:16px; background:#f8fbff; border-radius:8px;">
              <p style="margin:0 0 10px; font-size:14px; font-weight:bold;">
                Contact details
              </p>
              ${
                  COMPANY_EMAIL
                      ? `<p style="margin:4px 0; font-size:14px;">Email: ${escapeHtml(COMPANY_EMAIL)}</p>`
                      : ""
              }
              ${
                  COMPANY_PHONE
                      ? `<p style="margin:4px 0; font-size:14px;">Phone: ${escapeHtml(COMPANY_PHONE)}</p>`
                      : ""
              }
              ${
                  COMPANY_ADDRESS
                      ? `<p style="margin:4px 0; font-size:14px;">Address: ${escapeHtml(COMPANY_ADDRESS)}</p>`
                      : ""
              }
            </div>
            `
                    : ""
            }

            <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />

            <p style="font-size:14px; color:#777; text-align:center; margin:0 0 8px;">
              © ${new Date().getFullYear()} ${escapeHtml(companyName)} - All rights reserved.
            </p>

            ${
                COMPANY_LEGAL_NAME || COMPANY_NUMBER
                    ? `
            <p style="font-size:13px; color:#999; text-align:center; margin:0;">
              ${COMPANY_LEGAL_NAME ? escapeHtml(COMPANY_LEGAL_NAME) : ""}
              ${COMPANY_LEGAL_NAME && COMPANY_NUMBER ? " · " : ""}
              ${COMPANY_NUMBER ? `Company No. ${escapeHtml(COMPANY_NUMBER)}` : ""}
            </p>
            `
                    : ""
            }
          </div>
        </div>
        `;

        return await sendEmail(data.email, subject, text, html);
    },
};

function escapeHtml(value: string) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

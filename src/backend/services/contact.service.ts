import { sendEmail } from "@/backend/utils/sendEmail";
import { ENV } from "@/backend/config/env";

export const contactService = {
    async sendContact(data: {
        name: string;
        secondName: string;
        email: string;
        phone: string;
        message?: string;
    }) {
        if (!data?.name?.trim()) {
            throw new Error("First name is required");
        }

        if (!data?.secondName?.trim()) {
            throw new Error("Second name is required");
        }

        if (!data?.email?.trim()) {
            throw new Error("Email is required");
        }

        if (!data?.phone?.trim()) {
            throw new Error("Phone number is required");
        }

        const recipient = ENV.EMAIL_FROM || ENV.SUPPORT_EMAIL;

        if (!recipient) {
            throw new Error("Recipient email is not configured");
        }

        const subject = "📩 Contact form request";

        const text = `
Name: ${data.name}
Second Name: ${data.secondName}
Email: ${data.email}
Phone: ${data.phone}
Message: ${data.message || "(none)"}
        `.trim();

        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>📩 Contact form request</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Second Name:</strong> ${data.secondName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Message:</strong><br/>${data.message || "(none)"}</p>
            </div>
        `;

        await sendEmail(recipient, subject, text, html);

        return { message: "Contact request sent" };
    },
};
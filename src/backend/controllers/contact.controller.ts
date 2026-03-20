import { contactService, ContactValidationError } from "../services/contact.service";
import { MailConfigError, MailDeliveryError, MailRecipientError } from "../utils/sendEmail";

export const contactController = {
    async send(req: Request) {
        try {
            const body = await req.json();

            await contactService.sendContact(body);

            return new Response(
                JSON.stringify({ message: "Contact request sent" }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : "Internal server error";
            const status =
                error instanceof SyntaxError
                    ? 400
                    : error instanceof ContactValidationError
                    ? 400
                    : error instanceof MailConfigError || error instanceof MailRecipientError
                        ? 500
                        : error instanceof MailDeliveryError
                            ? 502
                            : 500;

            console.error("[contact] request failed", {
                status,
                error:
                    error instanceof Error
                        ? { name: error.name, message: error.message }
                        : String(error),
            });

            return new Response(
                JSON.stringify({ message }),
                {
                    status,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    },
};

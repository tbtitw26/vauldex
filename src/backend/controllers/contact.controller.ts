import { contactService } from "../services/contact.service";

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
            console.error("Contact request error:", error);

            return new Response(
                JSON.stringify({
                    message: error instanceof Error ? error.message : "Internal server error",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    },
};
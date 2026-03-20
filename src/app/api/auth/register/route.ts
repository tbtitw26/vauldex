import { NextRequest, NextResponse } from "next/server";
import { authController } from "@/backend/controllers/auth.controller";
import { attachAuthCookies } from "@/backend/utils/cookies";
import { RegistrationValidationError } from "@/shared/registration";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user, tokens } = await authController.register(body);
        const res = NextResponse.json({ user }, { status: 200 });
        attachAuthCookies(res, tokens.accessToken, tokens.refreshToken, 60 * 60 * 24 * 30);
        return res;
    } catch (e: any) {
        console.error("[api/auth/register] Registration failed", e);
        const msg = e?.message || "Registration error";
        const isRegistrationValidationError =
            e instanceof RegistrationValidationError ||
            e?.name === "RegistrationValidationError" ||
            (e?.fields && typeof e.fields === "object");

        if (isRegistrationValidationError) {
            return NextResponse.json(
                { type: "ValidationError", message: msg, errors: e.fields ?? {} },
                { status: 400 }
            );
        }

        if (e?.name === "ValidationError" && e?.errors) {
            const errors = Object.fromEntries(
                Object.entries(e.errors).map(([key, value]: [string, any]) => [
                    key,
                    value?.message || "Invalid value",
                ])
            );

            return NextResponse.json(
                { type: "ValidationError", message: msg, errors },
                { status: 400 }
            );
        }

        const isDuplicateEmail =
            msg.includes("registered") || e?.code === 11000 || /duplicate key/i.test(msg);
        const code = isDuplicateEmail ? 400 : 500;
        const type = isDuplicateEmail ? "EmailAlreadyRegistered" : "RegistrationError";
        return NextResponse.json({ type, message: msg }, { status: code });
    }
}

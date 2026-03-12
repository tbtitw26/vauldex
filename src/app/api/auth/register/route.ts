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
        const msg = e?.message || "Registration error";
        if (e instanceof RegistrationValidationError) {
            return NextResponse.json(
                { type: "ValidationError", message: msg, errors: e.fields },
                { status: 400 }
            );
        }
        const code = msg.includes("registered") ? 400 : 500;
        const type = msg.includes("registered") ? "EmailAlreadyRegistered" : "RegistrationError";
        return NextResponse.json({ type, message: msg }, { status: code });
    }
}

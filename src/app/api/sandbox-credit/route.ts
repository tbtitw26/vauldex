import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/config/db";
import { User } from "@/backend/models/user.model";

/**
 * DEV-ONLY endpoint for manually crediting tokens in sandbox/development mode.
 * Completely disabled when NODE_ENV=production (Next.js sets this automatically for `next start`).
 */
export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ message: "Not available in production" }, { status: 403 });
    }

    const rid =
        (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();

    try {
        const body = await req.json().catch(() => ({}));
        console.log(`[sandbox-credit][${rid}] Incoming body:`, body);

        const safeEmail = String(body?.email || "").trim().toLowerCase();
        const safeAmountRaw = Number(body?.amount);
        const safeAmount = Math.max(1, Math.floor(safeAmountRaw));

        console.log(`[sandbox-credit][${rid}] Parsed:`, {
            safeEmail,
            safeAmountRaw,
            safeAmount,
        });

        if (!safeEmail) {
            console.warn(`[sandbox-credit][${rid}] Missing email`);
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        if (!Number.isFinite(safeAmountRaw) || safeAmountRaw <= 0) {
            console.warn(`[sandbox-credit][${rid}] Invalid amount`, { safeAmountRaw });
            return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
        }

        console.log(`[sandbox-credit][${rid}] Connecting DB...`);
        await connectDB();
        console.log(`[sandbox-credit][${rid}] DB connected`);

        console.log(`[sandbox-credit][${rid}] Finding user by email...`);
        const user = await User.findOne({ email: safeEmail }).select("_id email tokens");
        if (!user) {
            console.warn(`[sandbox-credit][${rid}] User not found`, { safeEmail });
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        console.log(`[sandbox-credit][${rid}] User found`, {
            userId: user._id.toString(),
            email: user.email,
            tokensBefore: user.tokens ?? 0,
        });

        // DO NOT call userController.buyTokens here (it creates a new user if not found and triggers validation errors)
        // Only update tokens for an existing user
        user.tokens = (user.tokens || 0) + Math.floor(safeAmount);
        await user.save();

        console.log(`[sandbox-credit][${rid}] Success`, {
            userId: user._id,
            email: user.email,
            credited: safeAmount,
            tokensAfter: user.tokens,
        });

        return NextResponse.json({
            success: true,
            credited: safeAmount,
            user,
            info: `Sandbox credited ${safeAmount} tokens to ${user.email}`,
            rid,
        });
    } catch (err: any) {
        console.error(`[sandbox-credit][${rid}] Error:`, err);
        return NextResponse.json(
            { message: err?.message || "Server error", rid },
            { status: 500 }
        );
    }
}
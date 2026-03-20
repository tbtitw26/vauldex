import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middlewares/auth.middleware";
import { userController } from "@/backend/controllers/user.controller";
import { spoyntPaymentService } from "@/backend/services/spoyntPayment.service";
import { mailService } from "@/backend/services/mail.service";

function assertEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function basicAuthHeader(username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${token}`;
}

function isForceSuccessEnabled() {
    return process.env.SPOYNT_FORCE_SUCCESS === "true" && process.env.NODE_ENV !== "production";
}

async function sendPaymentConfirmationEmail(params: {
    cpi: string;
    user: { email: string; firstName?: string; tokens?: number };
    tokensAdded: number;
    referenceId?: string;
    amount?: number;
    currency?: string;
    source: string;
}) {
    try {
        console.info("[Spoynt] payment email attempt", {
            cpi: params.cpi,
            email: params.user.email,
            tokens: params.tokensAdded,
            source: params.source,
        });

        await mailService.sendPaymentConfirmationEmail({
            email: params.user.email,
            firstName: params.user.firstName,
            tokensAdded: params.tokensAdded,
            orderDate: new Date(),
            details: [
                { label: "Transaction type", value: "Token purchase" },
                { label: "Reference ID", value: String(params.referenceId || params.cpi) },
                { label: "Invoice amount", value: `${params.amount ?? "n/a"} ${params.currency ?? ""}`.trim() },
                { label: "New balance", value: `${params.user.tokens ?? "n/a"} tokens` },
                { label: "Confirmation source", value: params.source },
            ],
        });

        console.info("[Spoynt] payment email success", {
            cpi: params.cpi,
            email: params.user.email,
            tokens: params.tokensAdded,
            source: params.source,
        });
    } catch (error) {
        console.error("[Spoynt] payment email failed", {
            cpi: params.cpi,
            email: params.user.email,
            tokens: params.tokensAdded,
            source: params.source,
            error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
        });
    }
}

export async function GET(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        const cpi = new URL(req.url).searchParams.get("cpi");

        if (!cpi) return NextResponse.json({ message: "Missing cpi" }, { status: 400 });

        if (isForceSuccessEnabled()) {
            const tokensFromQuery = Number(new URL(req.url).searchParams.get("tokens"));
            const tokens = Number.isFinite(tokensFromQuery) && tokensFromQuery > 0 ? tokensFromQuery : null;

            const creditLock = await spoyntPaymentService.tryBeginCredit(cpi);
            if (creditLock) {
                try {
                    const creditTokens = tokens ?? (creditLock.tokens || 0);
                    if (creditTokens <= 0) {
                        return NextResponse.json({ status: "failed", message: "Missing tokens in sandbox" });
                    }

                    const user = await userController.buyTokens(payload.sub, Math.floor(creditTokens));
                    await spoyntPaymentService.markCredited(cpi);
                    await sendPaymentConfirmationEmail({
                        cpi,
                        user,
                        tokensAdded: Math.floor(creditTokens),
                        referenceId: creditLock.referenceId,
                        amount: creditLock.amount,
                        currency: creditLock.currency,
                        source: "Spoynt confirm (forced)",
                    });

                    return NextResponse.json({
                        status: "credited",
                        tokens: Math.floor(creditTokens),
                        user,
                        forced: true,
                        payment: {
                            cpi,
                            referenceId: creditLock.referenceId,
                            invoiceCurrency: creditLock.currency,
                            invoiceAmount: creditLock.amount,
                            uiCurrency: creditLock.uiCurrency,
                            uiAmount: creditLock.uiAmount,
                            status: creditLock.status,
                            resolution: creditLock.resolution,
                        },
                    });
                } catch (err) {
                    await spoyntPaymentService.releaseCreditLock(cpi);
                    throw err;
                }
            }

            const existing = await spoyntPaymentService.getByCpi(cpi);
            if (existing?.credited) {
                return NextResponse.json({
                    status: "credited",
                    tokens: existing.tokens,
                    forced: true,
                    payment: {
                        cpi,
                        referenceId: existing.referenceId,
                        invoiceCurrency: existing.currency,
                        invoiceAmount: existing.amount,
                        uiCurrency: existing.uiCurrency,
                        uiAmount: existing.uiAmount,
                        status: existing.status,
                        resolution: existing.resolution,
                    },
                });
            }

            return NextResponse.json({ status: "processing", payment: { cpi } });
        }

        const SPOYNT_BASE_URL = assertEnv("SPOYNT_BASE_URL");
        const SPOYNT_ACCOUNT_ID = assertEnv("SPOYNT_ACCOUNT_ID");
        const SPOYNT_API_KEY = assertEnv("SPOYNT_API_KEY");

        const url = `${SPOYNT_BASE_URL}/payment-invoices/${encodeURIComponent(cpi)}`;

        const r = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: basicAuthHeader(SPOYNT_ACCOUNT_ID, SPOYNT_API_KEY),
            },
            cache: "no-store",
        });

        const text = await r.text();
        if (!r.ok) {
            console.log("[Spoynt] confirm fetch error", { status: r.status, body: text, cpi });
            return NextResponse.json({ message: "Spoynt fetch failed", details: text }, { status: 502 });
        }

        const json = JSON.parse(text);
        const attrs = json?.data?.attributes;

        const status = attrs?.status;
        const resolution = attrs?.resolution;
        const metadata = attrs?.metadata || {};

        const userId = metadata.user_id;
        const tokens = Number(metadata.tokens);
        const paymentDebug = {
            cpi,
            referenceId: attrs?.reference_id,
            invoiceCurrency: attrs?.currency,
            invoiceAmount: Number(attrs?.amount),
            uiCurrency: metadata.ui_currency,
            uiAmount: Number(metadata.ui_amount),
            merchantName: metadata.merchant_name,
            status,
            resolution,
        };

        console.log("[Spoynt] confirm fetch response", paymentDebug);

        if (!userId || !Number.isFinite(tokens) || tokens <= 0) {
            return NextResponse.json({ message: "Invoice metadata missing", payment: paymentDebug }, { status: 400 });
        }

        if (userId !== payload.sub) {
            return NextResponse.json({ message: "Not your payment", payment: paymentDebug }, { status: 403 });
        }

        await spoyntPaymentService.markStatusByCpi({
            cpi,
            status,
            resolution,
            metadata,
            confirmed: true,
            userId,
            tokens,
            amount: Number(attrs?.amount),
            currency: attrs?.currency,
            referenceId: attrs?.reference_id,
        });

        if (status === "processed" && resolution === "ok") {
            const creditLock = await spoyntPaymentService.tryBeginCredit(cpi);
            if (!creditLock) {
                const existing = await spoyntPaymentService.getByCpi(cpi);
                if (existing?.credited) {
                    return NextResponse.json({ status: "credited", tokens: Math.floor(tokens), payment: paymentDebug });
                }
                return NextResponse.json({ status: "processing", payment: paymentDebug });
            }

            try {
                const user = await userController.buyTokens(payload.sub, Math.floor(tokens));
                await spoyntPaymentService.markCredited(cpi);
                await sendPaymentConfirmationEmail({
                    cpi,
                    user,
                    tokensAdded: Math.floor(tokens),
                    referenceId: attrs?.reference_id,
                    amount: Number(attrs?.amount),
                    currency: attrs?.currency,
                    source: "Spoynt confirm",
                });
                return NextResponse.json({ status: "credited", tokens: Math.floor(tokens), user, payment: paymentDebug });
            } catch (err) {
                await spoyntPaymentService.releaseCreditLock(cpi);
                throw err;
            }
        }

        if (status === "pending" || status === "created") {
            return NextResponse.json({ status: "pending", payment: paymentDebug });
        }

        return NextResponse.json({
            status: "failed",
            message: "Payment not confirmed",
            spoynt: { status, resolution },
            payment: paymentDebug,
        });
    } catch (err: any) {
        console.error("[Spoynt] confirm route error", err);
        return NextResponse.json({ message: err?.message || "Unknown error" }, { status: 400 });
    }
}

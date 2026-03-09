// app/api/spoynt/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middlewares/auth.middleware";
import crypto from "crypto";

const TOKENS_PER_GBP = 100;
const RATES_TO_GBP = { GBP: 1, EUR: 1.17, USD: 1.27 } as const;
const MIN_AMOUNT = 10;
const SPOYNT_MERCHANT_NAME = "Vauldex";
type SupportedCurrency = keyof typeof RATES_TO_GBP;

function assertEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function basicAuthHeader(username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${token}`;
}

function round2(n: number) {
    return Math.round(n * 100) / 100;
}

function getServiceForCurrency(currency: SupportedCurrency, fallback: string) {
    if (currency === "GBP") return fallback;
    const envName = `SPOYNT_DEFAULT_SERVICE_${currency}`;
    const candidate = process.env[envName];
    return candidate || fallback;
}

export async function POST(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        const body = await req.json().catch(() => ({}));

        let currency: SupportedCurrency = "GBP";
        let amountInCurrency: number | null = null;
        let tokens: number;

        if (typeof body.tokens === "number" && body.tokens > 0) {
            tokens = Math.floor(body.tokens);
            currency = "GBP";
            amountInCurrency = round2(tokens / TOKENS_PER_GBP);
            if (amountInCurrency < MIN_AMOUNT) {
                return NextResponse.json({ message: "Minimum is 10 GBP" }, { status: 400 });
            }
        } else if (body.currency && body.amount) {
            const requestedCurrency = String(body.currency).toUpperCase();
            if (!(requestedCurrency in RATES_TO_GBP)) {
                return NextResponse.json({ message: "Unsupported currency" }, { status: 400 });
            }
            currency = requestedCurrency as SupportedCurrency;
            const a = Number(body.amount);
            if (!Number.isFinite(a) || a <= 0) {
                return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
            }
            amountInCurrency = round2(a);
            if (amountInCurrency < MIN_AMOUNT) {
                return NextResponse.json({ message: `Minimum is 10 ${currency}` }, { status: 400 });
            }

            const gbpEquivalent = amountInCurrency / RATES_TO_GBP[currency];
            tokens = Math.floor(gbpEquivalent * TOKENS_PER_GBP);
        } else {
            return NextResponse.json(
                { message: "Provide either {tokens} or {currency, amount}" },
                { status: 400 }
            );
        }

        const invoiceCurrency = currency;
        const invoiceAmount = amountInCurrency!;
        const SPOYNT_BASE_URL = assertEnv("SPOYNT_BASE_URL");
        const SPOYNT_ACCOUNT_ID = assertEnv("SPOYNT_ACCOUNT_ID");
        const SPOYNT_API_KEY = assertEnv("SPOYNT_API_KEY");
        const SPOYNT_DEFAULT_SERVICE = assertEnv("SPOYNT_DEFAULT_SERVICE");
        const spoyntService = getServiceForCurrency(currency, SPOYNT_DEFAULT_SERVICE);
        const SPOYNT_CALLBACK_URL = assertEnv("SPOYNT_CALLBACK_URL");

        const SPOYNT_RETURN_SUCCESS = assertEnv("SPOYNT_RETURN_SUCCESS");
        const SPOYNT_RETURN_FAIL = assertEnv("SPOYNT_RETURN_FAIL");
        const SPOYNT_RETURN_PENDING = assertEnv("SPOYNT_RETURN_PENDING");
        const merchantName = SPOYNT_MERCHANT_NAME;
        const referenceId = crypto.randomUUID();
        const createUrl = `${SPOYNT_BASE_URL}/payment-invoices`;

        const invoicePayload = {
            data: {
                type: "payment-invoices",
                attributes: {
                    amount: invoiceAmount,
                    currency: invoiceCurrency,
                    service: spoyntService,
                    reference_id: referenceId,
                    description: `${merchantName} tokens: ${tokens}`,
                    callback_url: SPOYNT_CALLBACK_URL,
                    return_urls: {
                        success: SPOYNT_RETURN_SUCCESS,
                        fail: SPOYNT_RETURN_FAIL,
                        pending: SPOYNT_RETURN_PENDING,
                    },
                    metadata: {
                        user_id: payload.sub,
                        tokens: String(tokens),
                        ui_currency: currency,
                        ui_amount: String(invoiceAmount),
                        merchant_name: merchantName,
                    },
                },
            },
        };

        const r = await fetch(createUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
                Authorization: basicAuthHeader(SPOYNT_ACCOUNT_ID, SPOYNT_API_KEY),
            },
            body: JSON.stringify(invoicePayload),
        });

        if (!r.ok) {
            const text = await r.text();
            return NextResponse.json({ message: "Spoynt create invoice failed", details: text }, { status: 502 });
        }

        const json = await r.json();
        const cpi = json?.data?.id;
        if (!cpi) {
            return NextResponse.json({ message: "Spoynt response missing invoice id", raw: json }, { status: 502 });
        }

        const redirectUrl = `${SPOYNT_BASE_URL}/hpp/?cpi=${encodeURIComponent(cpi)}`;

        return NextResponse.json({
            cpi,
            referenceId,
            tokens,
            amount: invoiceAmount,
            currency: invoiceCurrency,
            redirectUrl,
        });
    } catch (err: any) {
        return NextResponse.json({ message: err?.message || "Unknown error" }, { status: 400 });
    }
}
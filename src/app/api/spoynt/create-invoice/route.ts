// app/api/spoynt/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middlewares/auth.middleware";
import crypto from "crypto";
import { spoyntPaymentService } from "@/backend/services/spoyntPayment.service";
import {
    convertToGBP,
    Currency,
    DEFAULT_PAYMENT_CURRENCY,
    getMinimumAmountForCurrency,
    isSupportedCurrency,
    MIN_GBP_AMOUNT,
    roundCurrency,
    TOKENS_PER_GBP,
} from "@/resources/currencies";

const SPOYNT_MERCHANT_NAME = "Vauldex";

type SpoyntResolution = {
    invoiceCurrency: Currency;
    service: string;
    fallbackToGBP: boolean;
    missingServiceEnvKey: string | null;
};

function assertEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function basicAuthHeader(username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString("base64");
    return `Basic ${token}`;
}

function resolveSpoyntCurrency(selectedCurrency: Currency, defaultService: string): SpoyntResolution {
    if (selectedCurrency === DEFAULT_PAYMENT_CURRENCY) {
        return {
            invoiceCurrency: DEFAULT_PAYMENT_CURRENCY,
            service: defaultService,
            fallbackToGBP: false,
            missingServiceEnvKey: null,
        };
    }

    const envKey = `SPOYNT_DEFAULT_SERVICE_${selectedCurrency}`;
    const service = process.env[envKey]?.trim();

    if (service) {
        return {
            invoiceCurrency: selectedCurrency,
            service,
            fallbackToGBP: false,
            missingServiceEnvKey: null,
        };
    }

    return {
        invoiceCurrency: DEFAULT_PAYMENT_CURRENCY,
        service: defaultService,
        fallbackToGBP: true,
        missingServiceEnvKey: envKey,
    };
}

function isForceSuccessEnabled() {
    return process.env.SPOYNT_FORCE_SUCCESS === "true" && process.env.NODE_ENV !== "production";
}

export async function POST(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        const body = await req.json().catch(() => ({}));

        let selectedCurrency: Currency = DEFAULT_PAYMENT_CURRENCY;
        let amountInSelectedCurrency: number | null = null;
        let tokens: number;

        if (typeof body.tokens === "number" && body.tokens > 0) {
            tokens = Math.floor(body.tokens);
            selectedCurrency = DEFAULT_PAYMENT_CURRENCY;
            amountInSelectedCurrency = roundCurrency(tokens / TOKENS_PER_GBP);
            if (amountInSelectedCurrency < MIN_GBP_AMOUNT) {
                return NextResponse.json({ message: `Minimum is ${MIN_GBP_AMOUNT} GBP` }, { status: 400 });
            }
        } else if (body.currency && body.amount) {
            const requestedCurrency = String(body.currency).toUpperCase();
            if (!isSupportedCurrency(requestedCurrency)) {
                return NextResponse.json({ message: "Unsupported currency" }, { status: 400 });
            }

            selectedCurrency = requestedCurrency;
            const amountNum = Number(body.amount);
            if (!Number.isFinite(amountNum) || amountNum <= 0) {
                return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
            }

            amountInSelectedCurrency = roundCurrency(amountNum);
            const minAmountForCurrency = getMinimumAmountForCurrency(selectedCurrency);
            if (amountInSelectedCurrency < minAmountForCurrency) {
                return NextResponse.json({ message: `Minimum is ${minAmountForCurrency} ${selectedCurrency}` }, { status: 400 });
            }

            const gbpEquivalent = convertToGBP(amountInSelectedCurrency, selectedCurrency);
            tokens = Math.floor(gbpEquivalent * TOKENS_PER_GBP);
        } else {
            return NextResponse.json(
                { message: "Provide either {tokens} or {currency, amount}" },
                { status: 400 }
            );
        }

        const defaultService = assertEnv("SPOYNT_DEFAULT_SERVICE");
        const resolution = resolveSpoyntCurrency(selectedCurrency, defaultService);
        const invoiceCurrency = resolution.invoiceCurrency;
        const invoiceAmount = resolution.fallbackToGBP
            ? roundCurrency(convertToGBP(amountInSelectedCurrency!, selectedCurrency))
            : amountInSelectedCurrency!;
        const gbpAmount = roundCurrency(convertToGBP(amountInSelectedCurrency!, selectedCurrency));

        if (invoiceAmount < 0.01 || gbpAmount < 0.01) {
            return NextResponse.json({ message: "Minimum is 0.01" }, { status: 400 });
        }

        const SPOYNT_RETURN_SUCCESS = assertEnv("SPOYNT_RETURN_SUCCESS");
        const referenceId = crypto.randomUUID();
        const merchantName = SPOYNT_MERCHANT_NAME;
        const forceSuccess = isForceSuccessEnabled();

        console.log("[Spoynt] normalized create-invoice request", {
            userId: payload.sub,
            requestBody: body,
            referenceId,
            merchantName,
            selectedCurrency,
            amountInSelectedCurrency,
            invoiceCurrency,
            invoiceAmount,
            gbpAmount,
            tokens,
            forceSuccess,
            fallbackToGBP: resolution.fallbackToGBP,
            missingServiceEnvKey: resolution.missingServiceEnvKey,
        });

        if (resolution.fallbackToGBP) {
            console.warn("[Spoynt] Selected currency is not configured; falling back to GBP", {
                selectedCurrency,
                invoiceCurrency,
                referenceId,
                missingServiceEnvKey: resolution.missingServiceEnvKey,
            });
        }

        if (forceSuccess) {
            const fakeCpi = `cpi_test_${crypto.randomUUID()}`;

            console.warn("[Spoynt] SPOYNT_FORCE_SUCCESS is enabled - bypassing real HPP/3DS", {
                cpi: fakeCpi,
                referenceId,
                invoiceCurrency,
                invoiceAmount,
            });

            await spoyntPaymentService.upsertFromInvoice({
                referenceId,
                cpi: fakeCpi,
                userId: payload.sub,
                tokens,
                amount: invoiceAmount,
                currency: invoiceCurrency,
                gbpAmount,
                uiCurrency: selectedCurrency,
                uiAmount: amountInSelectedCurrency!,
            });

            await spoyntPaymentService.markStatusByCpi({
                cpi: fakeCpi,
                status: "processed",
                resolution: "ok",
                referenceId,
                userId: payload.sub,
                tokens,
                amount: invoiceAmount,
                currency: invoiceCurrency,
                metadata: {
                    user_id: payload.sub,
                    tokens: String(tokens),
                    ui_currency: selectedCurrency,
                    ui_amount: String(amountInSelectedCurrency),
                    merchant_name: merchantName,
                    fallback_to_gbp: String(resolution.fallbackToGBP),
                },
            });

            const redirectUrl = `${SPOYNT_RETURN_SUCCESS}?cpi=${encodeURIComponent(fakeCpi)}`;

            return NextResponse.json({
                cpi: fakeCpi,
                referenceId,
                tokens,
                amount: invoiceAmount,
                currency: invoiceCurrency,
                uiCurrency: selectedCurrency,
                uiAmount: amountInSelectedCurrency,
                service: resolution.service,
                redirectUrl,
                forced: true,
                fallbackToGBP: resolution.fallbackToGBP,
            });
        }

        const SPOYNT_BASE_URL = assertEnv("SPOYNT_BASE_URL");
        const SPOYNT_ACCOUNT_ID = assertEnv("SPOYNT_ACCOUNT_ID");
        const SPOYNT_API_KEY = assertEnv("SPOYNT_API_KEY");
        const SPOYNT_CALLBACK_URL = assertEnv("SPOYNT_CALLBACK_URL");
        const SPOYNT_RETURN_FAIL = assertEnv("SPOYNT_RETURN_FAIL");
        const SPOYNT_RETURN_PENDING = assertEnv("SPOYNT_RETURN_PENDING");

        const createUrl = `${SPOYNT_BASE_URL}/payment-invoices`;
        const invoicePayload = {
            data: {
                type: "payment-invoices",
                attributes: {
                    amount: invoiceAmount,
                    currency: invoiceCurrency,
                    service: resolution.service,
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
                        ui_currency: selectedCurrency,
                        ui_amount: String(amountInSelectedCurrency),
                        merchant_name: merchantName,
                        fallback_to_gbp: String(resolution.fallbackToGBP),
                    },
                },
            },
        };

        console.log("[Spoynt] outgoing create-invoice payload", {
            url: createUrl,
            referenceId,
            cpi: null,
            service: resolution.service,
            invoiceCurrency,
            invoiceAmount,
            uiCurrency: selectedCurrency,
            uiAmount: amountInSelectedCurrency,
            gbpAmount,
            tokens,
            fallbackToGBP: resolution.fallbackToGBP,
            payload: invoicePayload,
        });

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
            console.log("[Spoynt] create-invoice error", {
                status: r.status,
                body: text,
                currency: invoiceCurrency,
                amount: invoiceAmount,
                service: resolution.service,
                fallbackToGBP: resolution.fallbackToGBP,
            });
            return NextResponse.json({ message: "Spoynt create invoice failed", details: text }, { status: 502 });
        }

        const json = await r.json();
        const cpi = json?.data?.id;
        const responseAttrs = json?.data?.attributes;

        console.log("[Spoynt] create-invoice response", {
            cpi,
            referenceId,
            responseCurrency: responseAttrs?.currency,
            responseAmount: responseAttrs?.amount,
            responseStatus: responseAttrs?.status,
            responseResolution: responseAttrs?.resolution,
            fallbackToGBP: resolution.fallbackToGBP,
            full: json,
        });

        if (!cpi) {
            return NextResponse.json({ message: "Spoynt response missing invoice id", raw: json }, { status: 502 });
        }

        await spoyntPaymentService.upsertFromInvoice({
            referenceId,
            cpi,
            userId: payload.sub,
            tokens,
            amount: invoiceAmount,
            currency: invoiceCurrency,
            gbpAmount,
            uiCurrency: selectedCurrency,
            uiAmount: amountInSelectedCurrency!,
        });

        const redirectUrl = `${SPOYNT_BASE_URL}/hpp/?cpi=${encodeURIComponent(cpi)}`;

        return NextResponse.json({
            cpi,
            referenceId,
            tokens,
            amount: invoiceAmount,
            currency: invoiceCurrency,
            uiCurrency: selectedCurrency,
            uiAmount: amountInSelectedCurrency,
            service: resolution.service,
            redirectUrl,
            fallbackToGBP: resolution.fallbackToGBP,
        });
    } catch (err: any) {
        console.error("[Spoynt] create-invoice route error", err);
        return NextResponse.json({ message: err?.message || "Unknown error" }, { status: 400 });
    }
}
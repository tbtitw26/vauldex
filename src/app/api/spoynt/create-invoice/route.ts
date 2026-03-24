// app/api/spoynt/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middlewares/auth.middleware";
import crypto from "crypto";
import { spoyntPaymentService } from "@/backend/services/spoyntPayment.service";
import { connectDB } from "@/backend/config/db";
import { User } from "@/backend/models/user.model";
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
import { getCountryOption } from "@/shared/registration";

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

    // Auto-derive service name from the standard Spoynt pattern:
    // payment_card_{currency_lowercase}_hpp
    const derivedService = `payment_card_${selectedCurrency.toLowerCase()}_hpp`;
    console.warn(`[Spoynt] env ${envKey} is empty — auto-deriving service: ${derivedService}`);

    return {
        invoiceCurrency: selectedCurrency,
        service: derivedService,
        fallbackToGBP: false,
        missingServiceEnvKey: envKey,
    };
}

function isForceSuccessEnabled() {
    return process.env.SPOYNT_FORCE_SUCCESS === "true" && process.env.NODE_ENV !== "production";
}

/**
 * Build the Spoynt `customer` block from the DB user record.
 * Minimum required: reference_id, name, email.
 * For UK cards (AVS): address with country, city, full_address, post_code.
 */
function buildCustomerBlock(user: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    phone?: string;
    country?: string;
    city?: string;
    street?: string;
    addressStreet?: string;
    postCode?: string;
    addressPostalCode?: string;
}) {
    const name =
        (user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim()) || "Customer";
    const phone = (user.phoneNumber || user.phone || "").replace(/[^\d+]/g, "");
    const country = (user.country || "").trim();
    const city = (user.city || "").trim();
    const street = (user.street || user.addressStreet || "").trim();
    const postCode = (user.postCode || user.addressPostalCode || "").trim();

    // Spoynt requires ISO 3166-1 alpha-2 country code (e.g. "GB", "US").
    // DB may store full name ("United Kingdom") or already a code ("GB").
    const countryOption = country ? getCountryOption(country) : null;
    const countryCode = countryOption?.code || (country.length === 2 ? country.toUpperCase() : "");

    console.log("[Spoynt] buildCustomerBlock country resolution", {
        rawCountry: country,
        resolvedCode: countryCode,
        matchedOption: countryOption?.label ?? null,
    });

    const customer: Record<string, unknown> = {
        reference_id: user._id.toString(),
        name,
        email: user.email,
    };

    if (phone) customer.phone = phone;

    // Include address block when we have at least country (needed for UK AVS)
    if (countryCode) {
        const address: Record<string, string> = { country: countryCode };
        if (city) address.city = city;
        if (street) address.full_address = street;
        if (postCode) address.post_code = postCode;
        customer.address = address;
    }

    return customer;
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

        // ── Fetch user from DB for Spoynt customer block ────────────
        await connectDB();
        const dbUser = await User.findById(payload.sub).lean();
        if (!dbUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        const customer = buildCustomerBlock(dbUser as any);

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
        const successUrlWithRef = `${SPOYNT_RETURN_SUCCESS}?ref=${encodeURIComponent(referenceId)}`;
        const failUrlWithRef = `${SPOYNT_RETURN_FAIL}?ref=${encodeURIComponent(referenceId)}`;
        const pendingUrlWithRef = `${SPOYNT_RETURN_PENDING}?ref=${encodeURIComponent(referenceId)}`;

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
                        success: successUrlWithRef,
                        fail: failUrlWithRef,
                        pending: pendingUrlWithRef,
                    },
                    customer,
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
                Accept: "application/json",
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
            checkoutUrl: responseAttrs?.checkout_url,
            flow: responseAttrs?.flow,
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

        // Spoynt API returns:
        //   - hpp_url: "https://api.spoynt.com/redirect/hpp/?cpi=..." (302 → actual HPP)
        //   - flow_data.action: "https://checkout.bankgate.io/hpp/..." (the actual HPP page)
        //   - checkout_url: NOT present in current API version
        // We prefer hpp_url → flow_data.action → manual fallback.
        const spoyntHppUrl = responseAttrs?.hpp_url;
        const flowDataAction = responseAttrs?.flow_data?.action;
        const spoyntCheckoutUrl = responseAttrs?.checkout_url; // legacy/future compat
        const hppFallbackBase = process.env.SPOYNT_HPP_URL || SPOYNT_BASE_URL;
        const manualFallback = `${hppFallbackBase}/redirect/hpp/?cpi=${encodeURIComponent(cpi)}`;

        const redirectUrl = spoyntHppUrl || flowDataAction || spoyntCheckoutUrl || manualFallback;

        console.log("[Spoynt] resolved redirect URL", {
            cpi,
            spoyntHppUrl,
            flowDataAction,
            spoyntCheckoutUrl,
            manualFallback,
            redirectUrl,
        });

        if (!spoyntHppUrl && !flowDataAction && !spoyntCheckoutUrl) {
            console.warn("[Spoynt] No HPP URL found in response — using manual fallback", {
                cpi,
                redirectUrl,
                hppFallbackBase,
            });
        }

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
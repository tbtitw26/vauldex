// Visible on the frontend selectors only.
// Vauldex: only EUR is available via Spoynt (payment_card_eur_hpp).
// AUD, CAD, NZD are Averis-only.
export const DISPLAY_CURRENCIES = [
    "EUR",
    "GBP",
    // "NOK",
] as const;

// Supported by checkout/backend, including currencies that can fall back to EUR until their Spoynt services are configured.
export const SUPPORTED_CURRENCIES = [
    ...DISPLAY_CURRENCIES,
    "NOK",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_PAYMENT_CURRENCY: Currency = "EUR";
export const DEFAULT_DISPLAY_CURRENCY: Currency = "EUR";
export const MIN_GBP_AMOUNT = 10;
export const TOKENS_PER_GBP = 100;

export const CURRENCY_SIGNS: Record<Currency, string> = {
    GBP: "£",
    EUR: "€",
    NOK: "kr",
};

// 1 GBP = X target currency units
export const CURRENCY_PER_GBP: Record<Currency, number> = {
    GBP: 1,
    EUR: 1.17,
    NOK: 13.6,
};

export function isSupportedCurrency(value: string): value is Currency {
    return SUPPORTED_CURRENCIES.includes(value as Currency);
}

export function roundCurrency(value: number) {
    return Math.round(value * 100) / 100;
}

export function convertFromGBP(amountInGBP: number, currency: Currency) {
    return amountInGBP * CURRENCY_PER_GBP[currency];
}

export function convertToGBP(amountInCurrency: number, currency: Currency) {
    return amountInCurrency / CURRENCY_PER_GBP[currency];
}

export function getMinimumAmountForCurrency(currency: Currency) {
    return roundCurrency(convertFromGBP(MIN_GBP_AMOUNT, currency));
}

// Visible on the frontend selectors only.
export const DISPLAY_CURRENCIES = [
    "GBP",
    "EUR",
    // "AUD",
    // "CAD",
    // "NZD",
    // "NOK",
] as const;

// Supported by checkout/backend, including currencies that can fall back to GBP until their Spoynt services are configured.
export const SUPPORTED_CURRENCIES = [
    ...DISPLAY_CURRENCIES,
    "AUD",
    "CAD",
    "NZD",
    "NOK",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_PAYMENT_CURRENCY: Currency = "GBP";
export const MIN_GBP_AMOUNT = 10;
export const TOKENS_PER_GBP = 100;

export const CURRENCY_SIGNS: Record<Currency, string> = {
    GBP: "£",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    NZD: "NZ$",
    NOK: "kr",
};

// 1 GBP = X target currency units
export const CURRENCY_PER_GBP: Record<Currency, number> = {
    GBP: 1,
    EUR: 1.17,
    AUD: 1.93,
    CAD: 1.72,
    NZD: 2.07,
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

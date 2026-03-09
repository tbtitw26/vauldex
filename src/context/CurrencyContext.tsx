"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    CURRENCY_SIGNS,
    Currency,
    DEFAULT_PAYMENT_CURRENCY,
    CURRENCY_PER_GBP,
} from "@/resources/currencies";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (val: Currency) => void;
    sign: string;
    rateToGBP: number;
    convertFromGBP: (gbp: number) => number;
    convertToGBP: (val: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: DEFAULT_PAYMENT_CURRENCY,
    setCurrency: () => {},
    sign: "£",
    rateToGBP: 1,
    convertFromGBP: (v) => v,
    convertToGBP: (v) => v,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>(DEFAULT_PAYMENT_CURRENCY);

    const rateToGBP = CURRENCY_PER_GBP[currency];
    const sign = CURRENCY_SIGNS[currency];

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                sign,
                rateToGBP,
                convertFromGBP: (gbp) => gbp * rateToGBP,
                convertToGBP: (val) => val / rateToGBP,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};
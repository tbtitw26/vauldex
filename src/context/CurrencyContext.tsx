"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    CURRENCY_SIGNS,
    Currency,
    DEFAULT_DISPLAY_CURRENCY,
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
    currency: DEFAULT_DISPLAY_CURRENCY,
    setCurrency: () => {},
    sign: CURRENCY_SIGNS[DEFAULT_DISPLAY_CURRENCY],
    rateToGBP: CURRENCY_PER_GBP[DEFAULT_DISPLAY_CURRENCY],
    convertFromGBP: (v) => v,
    convertToGBP: (v) => v,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>(DEFAULT_DISPLAY_CURRENCY);

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
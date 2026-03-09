"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./PricingCard.module.scss";
import ButtonUI from "@/components/ui/button/ButtonUI";
import { useAlert } from "@/context/AlertContext";
import { useUser } from "@/context/UserContext";
import Input from "@mui/joy/Input";
import { useCurrency } from "@/context/CurrencyContext";
import { Currency, getMinimumAmountForCurrency, MIN_GBP_AMOUNT, TOKENS_PER_GBP } from "@/resources/currencies";

interface PricingCardProps {
    variant?: "starter" | "pro" | "premium" | "custom";
    title: string;
    price: string;
    tokens: number;
    description: string;
    features: string[];
    buttonText: string;
    badgeTop?: string;
    badgeBottom?: string;
    index?: number;
}

type CreateInvoiceBody = { currency: Currency; amount: number };

type CreateInvoiceResponse = {
    cpi?: string;
    referenceId?: string;
    tokens?: number;
    amount?: number;
    currency?: string;
    uiCurrency?: string;
    uiAmount?: number;
    service?: string;
    redirectUrl?: string;
    forced?: boolean;
    fallbackToGBP?: boolean;
};

const PricingCard: React.FC<PricingCardProps> = ({
                                                     variant = "starter",
                                                     title,
                                                     price,
                                                     tokens,
                                                     description,
                                                     features,
                                                     buttonText,
                                                     badgeTop,
                                                     badgeBottom,
                                                     index = 0,
                                                 }) => {
    const { showAlert } = useAlert();
    const user = useUser();
    const { currency, sign, convertFromGBP, convertToGBP } = useCurrency();

    const [customAmountInput, setCustomAmountInput] = useState<string>(String(MIN_GBP_AMOUNT));
    const isCustom = price === "dynamic";

    const minAmountInCurrency = useMemo(
        () => getMinimumAmountForCurrency(currency),
        [currency]
    );

    useEffect(() => {
        if (!isCustom) return;
        setCustomAmountInput(minAmountInCurrency.toFixed(2));
    }, [isCustom, minAmountInCurrency]);

    const parsedCustomAmount = useMemo(() => {
        const n = Number(customAmountInput.replace(/,/g, "."));
        return Number.isFinite(n) ? n : NaN;
    }, [customAmountInput]);

    const clampedCustomAmount = useMemo(() => {
        if (!Number.isFinite(parsedCustomAmount)) return minAmountInCurrency;
        return Math.max(minAmountInCurrency, parsedCustomAmount);
    }, [parsedCustomAmount, minAmountInCurrency]);

    const basePriceGBP = useMemo(() => {
        if (isCustom) return 0;
        const num = parseFloat(price.replace(/[^0-9.]/g, ""));
        return isNaN(num) ? 0 : num;
    }, [price, isCustom]);

    const convertedPrice = useMemo(() => {
        if (isCustom) return 0;
        return convertFromGBP(basePriceGBP);
    }, [basePriceGBP, convertFromGBP, isCustom]);

    const handleBuy = async () => {
        if (!user) {
            showAlert("Please sign up", "You need to be signed in to purchase", "info");
            setTimeout(() => (window.location.href = "/sign-up"), 1200);
            return;
        }

        try {
            const endpoint = "/api/spoynt/create-invoice";

            let body: CreateInvoiceBody;
            let expectedTokens: number;
            let selectedUiAmount: number;

            if (isCustom) {
                if (!Number.isFinite(parsedCustomAmount)) {
                    showAlert(
                        `Minimum is ${minAmountInCurrency.toFixed(2)} ${currency}`,
                        `Enter at least ${minAmountInCurrency.toFixed(2)} ${currency}`,
                        "warning"
                    );
                    return;
                }

                if (clampedCustomAmount < minAmountInCurrency) {
                    showAlert(
                        `Minimum is ${minAmountInCurrency.toFixed(2)} ${currency}`,
                        `Enter at least ${minAmountInCurrency.toFixed(2)} ${currency}`,
                        "warning"
                    );
                    return;
                }

                selectedUiAmount = Number(clampedCustomAmount.toFixed(2));
                body = { currency, amount: selectedUiAmount };
                expectedTokens = Math.floor(convertToGBP(clampedCustomAmount) * TOKENS_PER_GBP);
            } else {
                selectedUiAmount = Math.max(minAmountInCurrency, Number(convertedPrice.toFixed(2)));
                body = { currency, amount: selectedUiAmount };
                expectedTokens = tokens;
            }

            console.log("[Spoynt][client] create-invoice request", {
                plan: title,
                variant,
                requestBody: body,
                expectedTokens,
                basePriceGBP,
                displayedCurrency: currency,
                displayedAmount: selectedUiAmount,
            });

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) as CreateInvoiceResponse & { message?: string; details?: string } : {};

            console.log("[Spoynt][client] create-invoice response", {
                httpStatus: res.status,
                response: data,
            });

            if (!res.ok || !data.redirectUrl || !data.cpi) {
                showAlert("Error", data?.message || text || "Something went wrong", "error");
                return;
            }

            localStorage.setItem("spoyntLastCpi", data.cpi || "");
            localStorage.setItem("spoyntForced", String(!!data.forced));

            const purchaseIntent = {
                cpi: data.cpi,
                referenceId: data.referenceId || "",
                tokens: Number(data.tokens || expectedTokens),
                createdAt: Date.now(),
                currency: data.currency || "GBP",
                amount: Number(data.amount || convertToGBP(selectedUiAmount)),
                uiCurrency: data.uiCurrency || currency,
                uiAmount: Number(data.uiAmount || selectedUiAmount),
                service: data.service || "",
                fallbackToGBP: Boolean(data.fallbackToGBP),
            };

            localStorage.setItem("pendingPurchase", JSON.stringify(purchaseIntent));
            localStorage.setItem("spoyntLastTokens", String(purchaseIntent.tokens));
            localStorage.setItem("spoyntOrderRef", purchaseIntent.referenceId || "");

            console.log("[Spoynt][client] redirecting to HPP/3DS", {
                cpi: purchaseIntent.cpi,
                referenceId: purchaseIntent.referenceId,
                invoiceCurrency: purchaseIntent.currency,
                invoiceAmount: purchaseIntent.amount,
                uiCurrency: purchaseIntent.uiCurrency,
                uiAmount: purchaseIntent.uiAmount,
                fallbackToGBP: purchaseIntent.fallbackToGBP,
                redirectUrl: data.redirectUrl,
            });

            window.location.href = data.redirectUrl;
        } catch (err: any) {
            console.error("[Spoynt][client] create-invoice error", err);
            showAlert("Error", err.message || "Something went wrong", "error");
        }
    };

    const tokensCalculated = useMemo(() => {
        const gbpEquivalent = convertToGBP(clampedCustomAmount);
        return Math.floor(gbpEquivalent * TOKENS_PER_GBP);
    }, [clampedCustomAmount, convertToGBP]);

    return (
        <motion.div
            className={`${styles.card} ${styles[variant]}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
        >
            {badgeTop && <span className={styles.badgeTop}>{badgeTop}</span>}
            <h3 className={styles.title}>{title}</h3>

            {isCustom ? (
                <>
                    <div className={styles.inputWrapper}>
                        <Input
                            type="number"
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            onBlur={() => setCustomAmountInput(clampedCustomAmount.toFixed(2))}
                            placeholder="Enter amount"
                            size="md"
                            startDecorator={sign}
                            slotProps={{
                                input: {
                                    min: minAmountInCurrency,
                                    step: 0.01,
                                },
                            }}
                        />
                    </div>
                    <p className={styles.dynamicPrice}>
                        {sign}
                        {Number.isFinite(parsedCustomAmount) ? clampedCustomAmount.toFixed(2) : "--"} {currency}
                        ~ {tokensCalculated} tokens
                    </p>
                </>
            ) : (
                <p className={styles.price}>
                    {sign}
                    {convertedPrice.toFixed(2)}{" "}
                    <span className={styles.tokens}>/ {tokens} tokens</span>
                </p>
            )}

            <p className={styles.description}>{description}</p>
            <ul className={styles.features}>
                {features.map((f, i) => (
                    <li key={i}>{f}</li>
                ))}
            </ul>

            <ButtonUI fullWidth onClick={handleBuy} hoverColor="tertiary" hoverTextColor="quaternary">
                {user ? buttonText : "Sign Up to Buy"}
            </ButtonUI>

            {badgeBottom && <span className={styles.badgeBottom}>{badgeBottom}</span>}
        </motion.div>
    );
};

export default PricingCard;


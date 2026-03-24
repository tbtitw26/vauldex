"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./PaymentSuccess.module.scss";

type PageState = "loading" | "pending" | "ok" | "error";

type PendingPurchase = {
    cpi?: string;
    referenceId?: string;
    tokens: number;
    createdAt: number;
    currency?: string;
    amount?: number;
    uiCurrency?: string;
    uiAmount?: number;
    service?: string;
};

type ConfirmResponse = {
    status?: "pending" | "processing" | "credited" | "failed";
    message?: string;
    tokens?: number;
    forced?: boolean;
    payment?: {
        cpi?: string;
        referenceId?: string;
        invoiceCurrency?: string;
        invoiceAmount?: number;
        uiCurrency?: string;
        uiAmount?: number;
        merchantName?: string;
        status?: string;
        resolution?: string;
    };
    spoynt?: {
        status?: string;
        resolution?: string;
    };
};

const MAX_CONFIRM_ATTEMPTS = 15;
const CONFIRM_RETRY_MS = 2000;

export default function PaymentSuccessPage() {
    const sp = useSearchParams();

    const [state, setState] = useState<PageState>("loading");
    const [msg, setMsg] = useState<string>("Checking your payment with Spoynt...");
    const [creditedTokens, setCreditedTokens] = useState<number | null>(null);
    const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);
    const [referenceId, setReferenceId] = useState<string>("");
    const [paymentSnapshot, setPaymentSnapshot] = useState<ConfirmResponse["payment"] | null>(null);

    const cpiFromQuery = sp.get("cpi") || sp.get("id") || sp.get("invoice_id") || "";
    const refFromQuery = sp.get("ref") || "";

    const badgeClass =
        state === "ok"
            ? styles.badgeOk
            : state === "pending"
                ? styles.badgePending
                : state === "error"
                    ? styles.badgeError
                    : styles.badgeLoading;

    useEffect(() => {
        try {
            const raw = localStorage.getItem("pendingPurchase");
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<PendingPurchase>;
                if (parsed && Number.isFinite(parsed.tokens)) {
                    const hydratedPurchase: PendingPurchase = {
                        cpi: String(parsed.cpi || cpiFromQuery || ""),
                        referenceId: String(parsed.referenceId || refFromQuery || localStorage.getItem("spoyntOrderRef") || ""),
                        tokens: Number(parsed.tokens),
                        createdAt: Number(parsed.createdAt) || Date.now(),
                        currency: parsed.currency ? String(parsed.currency) : undefined,
                        amount: Number.isFinite(Number(parsed.amount)) ? Number(parsed.amount) : undefined,
                        uiCurrency: parsed.uiCurrency ? String(parsed.uiCurrency) : undefined,
                        uiAmount: Number.isFinite(Number(parsed.uiAmount)) ? Number(parsed.uiAmount) : undefined,
                        service: parsed.service ? String(parsed.service) : undefined,
                    };
                    setPendingPurchase(hydratedPurchase);
                    setReferenceId(hydratedPurchase.referenceId || "");
                    return;
                }
            }

            if (cpiFromQuery) {
                setPendingPurchase({
                    cpi: cpiFromQuery,
                    referenceId: refFromQuery || localStorage.getItem("spoyntOrderRef") || "",
                    tokens: Number(localStorage.getItem("spoyntLastTokens")) || 0,
                    createdAt: Date.now(),
                });
                setReferenceId(refFromQuery || localStorage.getItem("spoyntOrderRef") || "");
                return;
            }

            if (refFromQuery) {
                setPendingPurchase({
                    cpi: "",
                    referenceId: refFromQuery,
                    tokens: Number(localStorage.getItem("spoyntLastTokens")) || 0,
                    createdAt: Date.now(),
                });
                setReferenceId(refFromQuery);
                return;
            }

            setState("error");
            setMsg("Missing payment reference. Please contact support if you were charged.");
        } catch (error) {
            console.error("[Spoynt][client] failed to restore payment context", error);
            setState("error");
            setMsg("Could not restore your payment details.");
        }
    }, [cpiFromQuery, refFromQuery]);

    useEffect(() => {
        const targetCpi = cpiFromQuery || pendingPurchase?.cpi || "";
        const targetRef = refFromQuery || pendingPurchase?.referenceId || "";
        if ((!targetCpi && !targetRef) || !pendingPurchase) return;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const confirmOnce = async (attempt: number) => {
            if (cancelled) return;

            if (attempt === 1) {
                setState("loading");
                setMsg("Opening payment confirmation... If you completed 3DS, we are finalizing your order.");
            } else {
                setState("pending");
                setMsg(`Waiting for Spoynt confirmation after 3DS... Attempt ${attempt}/${MAX_CONFIRM_ATTEMPTS}.`);
            }

            console.log("[Spoynt][client] confirm request", {
                attempt,
                cpi: targetCpi,
                ref: targetRef,
                pendingPurchase,
            });

            try {
                const confirmParams = new URLSearchParams();
                if (targetCpi) confirmParams.set("cpi", targetCpi);
                if (targetRef) confirmParams.set("ref", targetRef);

                const runConfirm = () =>
                    fetch(`/api/spoynt/confirm?${confirmParams.toString()}`, {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    });

                let res = await runConfirm();

                if (res.status === 401) {
                    console.warn("[Spoynt][client] confirm returned 401, attempting refresh...");
                    const refreshRes = await fetch("/api/auth/refresh", {
                        method: "POST",
                        credentials: "include",
                        cache: "no-store",
                    });
                    if (refreshRes.ok) {
                        res = await runConfirm();
                    }
                }

                const text = await res.text();
                const data = text ? JSON.parse(text) as ConfirmResponse : {};

                console.log("[Spoynt][client] confirm response", {
                    attempt,
                    httpStatus: res.status,
                    response: data,
                });

                if (!res.ok) {
                    if (!cancelled) {
                        setState("error");
                        setMsg(data?.message || "Payment confirmation failed.");
                    }
                    return;
                }

                if (data.payment) {
                    setPaymentSnapshot(data.payment);
                    if (data.payment.referenceId) setReferenceId(data.payment.referenceId);
                }

                if (data.status === "credited") {
                    if (cancelled) return;
                    setState("ok");
                    setCreditedTokens(Number(data.tokens || pendingPurchase.tokens || 0));
                    setMsg("Payment confirmed by Spoynt. Tokens credited successfully.");
                    localStorage.removeItem("pendingPurchase");
                    localStorage.removeItem("spoyntForced");
                    return;
                }

                if ((data.status === "pending" || data.status === "processing") && attempt < MAX_CONFIRM_ATTEMPTS) {
                    timeoutId = setTimeout(() => {
                        void confirmOnce(attempt + 1);
                    }, CONFIRM_RETRY_MS);
                    return;
                }

                if (data.status === "pending" || data.status === "processing") {
                    if (!cancelled) {
                        setState("pending");
                        setMsg("Spoynt is still processing the payment. Please refresh this page in a moment.");
                    }
                    return;
                }

                if (!cancelled) {
                    setState("error");
                    setMsg(data?.message || "Payment was not confirmed.");
                }
            } catch (error) {
                console.error("[Spoynt][client] confirm error", error);
                if (!cancelled) {
                    setState("error");
                    setMsg(error instanceof Error ? error.message : "Unexpected confirmation error.");
                }
            }
        };

        void confirmOnce(1);

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [cpiFromQuery, pendingPurchase]);

    const formattedPendingDate = useMemo(() => {
        if (!pendingPurchase) return "—";
        return new Date(pendingPurchase.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [pendingPurchase]);

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Payment status</h1>
                        <p className={styles.subtitle}>We are confirming your payment with Spoynt and checking the 3DS result.</p>
                    </div>
                    <span className={`${styles.badge} ${badgeClass}`}>
                        {state === "ok" ? "Confirmed" : state === "pending" ? "Pending" : state === "error" ? "Error" : "Loading"}
                    </span>
                </div>

                <p className={styles.message}>{msg}</p>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <span>Selected package</span>
                        <span className={styles.detailValue}>
                            {pendingPurchase ? `${pendingPurchase.tokens} tokens` : "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Reference</span>
                        <span className={styles.detailValue}>{referenceId || pendingPurchase?.referenceId || "—"}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Credited tokens</span>
                        <span className={styles.detailValue}>
                            {creditedTokens !== null ? `${creditedTokens} tokens` : "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Selected at</span>
                        <span className={styles.detailValue}>{formattedPendingDate}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Invoice currency</span>
                        <span className={styles.detailValue}>{paymentSnapshot?.invoiceCurrency || pendingPurchase?.currency || "—"}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Invoice amount</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.invoiceAmount ?? pendingPurchase?.amount ?? "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Requested currency</span>
                        <span className={styles.detailValue}>{paymentSnapshot?.uiCurrency || pendingPurchase?.uiCurrency || "—"}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Requested amount</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.uiAmount ?? pendingPurchase?.uiAmount ?? "—"}
                        </span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <a className={styles.primaryBtn} href="/dashboard">
                        Go to dashboard
                    </a>
                    <a className={styles.secondaryBtn} href="/pricing">
                        Buy more tokens
                    </a>
                </div>

                <p className={styles.meta}>CPI: {cpiFromQuery || pendingPurchase?.cpi || "—"}</p>
                <p className={styles.meta}>Reference: {referenceId || pendingPurchase?.referenceId || "—"}</p>
            </section>
        </main>
    );
}

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

/* ── SVG icons ── */
const CheckIcon = () => (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ClockIcon = () => (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const AlertIcon = () => (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

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

    const iconWrapperClass =
        state === "ok"
            ? styles.iconOk
            : state === "pending"
                ? styles.iconPending
                : state === "error"
                    ? styles.iconError
                    : styles.iconLoading;

    const StatusIcon =
        state === "ok"
            ? CheckIcon
            : state === "pending"
                ? ClockIcon
                : state === "error"
                    ? AlertIcon
                    : null;

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

    const displayCpi = cpiFromQuery || pendingPurchase?.cpi || "—";
    const displayRef = referenceId || pendingPurchase?.referenceId || "—";

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                {/* Icon */}
                <div className={`${styles.iconWrapper} ${iconWrapperClass}`}>
                    {StatusIcon ? <StatusIcon /> : <div className={styles.spinner} />}
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>
                            {state === "ok"
                                ? "Payment confirmed"
                                : state === "pending"
                                    ? "Payment processing"
                                    : state === "error"
                                        ? "Payment issue"
                                        : "Verifying payment"}
                        </h1>
                        <p className={styles.subtitle}>
                            {state === "ok"
                                ? "Your tokens have been credited to your account."
                                : state === "pending"
                                    ? "We're waiting for Spoynt to finalize the 3DS verification."
                                    : state === "error"
                                        ? "Something went wrong during payment verification."
                                        : "We are confirming your payment with Spoynt…"}
                        </p>
                    </div>
                    <span className={`${styles.badge} ${badgeClass}`}>
                        {state === "ok" ? "Confirmed" : state === "pending" ? "Pending" : state === "error" ? "Error" : "Loading"}
                    </span>
                </div>

                <p className={styles.message}>{msg}</p>

                <div className={styles.divider} />

                {/* Token highlight block */}
                {(creditedTokens !== null || (pendingPurchase && pendingPurchase.tokens > 0)) && (
                    <div className={styles.highlightBlock}>
                        <div>
                            <div className={styles.highlightLabel}>
                                {creditedTokens !== null ? "Credited tokens" : "Selected package"}
                            </div>
                        </div>
                        <div className={styles.highlightValue}>
                            {creditedTokens !== null ? creditedTokens : pendingPurchase?.tokens} tokens
                        </div>
                    </div>
                )}

                {/* Details grid */}
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Payment ID (CPI)</span>
                        <span className={styles.detailValueMono}>{displayCpi}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Reference ID</span>
                        <span className={styles.detailValueMono}>{displayRef}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Status</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.status || (state === "ok" ? "Processed" : state === "pending" ? "Processing" : state === "error" ? "Failed" : "Checking...")}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Resolution</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.resolution || (state === "ok" ? "OK" : "—")}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Invoice currency</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.invoiceCurrency || pendingPurchase?.currency || "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Invoice amount</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.invoiceAmount ?? pendingPurchase?.amount ?? "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Requested currency</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.uiCurrency || pendingPurchase?.uiCurrency || "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Requested amount</span>
                        <span className={styles.detailValue}>
                            {paymentSnapshot?.uiAmount ?? pendingPurchase?.uiAmount ?? "—"}
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>{formattedPendingDate}</span>
                    </div>
                    {paymentSnapshot?.merchantName && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Merchant</span>
                            <span className={styles.detailValue}>{paymentSnapshot.merchantName}</span>
                        </div>
                    )}
                </div>

                <div className={styles.divider} />

                {/* Actions */}
                <div className={styles.actions}>
                    <a className={styles.primaryBtn} href="/dashboard">
                        Go to dashboard
                    </a>
                    <a className={styles.secondaryBtn} href="/pricing">
                        Buy more tokens
                    </a>
                    {state === "error" && (
                        <a className={styles.secondaryBtn} href="/contact-us">
                            Contact support
                        </a>
                    )}
                </div>
            </section>
        </main>
    );
}

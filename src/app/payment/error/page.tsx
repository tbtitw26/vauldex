"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../success/PaymentSuccess.module.scss";

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

const XCircleIcon = () => (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

export default function PaymentErrorPage() {
    const sp = useSearchParams();
    const cpiFromQuery = sp.get("cpi") || sp.get("id") || sp.get("invoice_id") || "";
    const refFromQuery = sp.get("ref") || "";
    const reason = sp.get("reason") || sp.get("error") || "";

    const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("pendingPurchase");
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<PendingPurchase>;
                if (parsed && Number.isFinite(parsed.tokens)) {
                    setPendingPurchase({
                        cpi: String(parsed.cpi || cpiFromQuery || ""),
                        referenceId: String(parsed.referenceId || refFromQuery || localStorage.getItem("spoyntOrderRef") || ""),
                        tokens: Number(parsed.tokens),
                        createdAt: Number(parsed.createdAt) || Date.now(),
                        currency: parsed.currency ? String(parsed.currency) : undefined,
                        amount: Number.isFinite(Number(parsed.amount)) ? Number(parsed.amount) : undefined,
                        uiCurrency: parsed.uiCurrency ? String(parsed.uiCurrency) : undefined,
                        uiAmount: Number.isFinite(Number(parsed.uiAmount)) ? Number(parsed.uiAmount) : undefined,
                        service: parsed.service ? String(parsed.service) : undefined,
                    });
                    return;
                }
            }
            // Fallback: build from URL params only
            setPendingPurchase({
                cpi: cpiFromQuery,
                referenceId: refFromQuery || localStorage.getItem("spoyntOrderRef") || "",
                tokens: Number(localStorage.getItem("spoyntLastTokens")) || 0,
                createdAt: Date.now(),
            });
        } catch {
            setPendingPurchase({
                cpi: cpiFromQuery,
                referenceId: refFromQuery,
                tokens: 0,
                createdAt: Date.now(),
            });
        }
    }, [cpiFromQuery, refFromQuery]);

    const displayCpi = cpiFromQuery || pendingPurchase?.cpi || "—";
    const displayRef = refFromQuery || pendingPurchase?.referenceId || "—";

    const formattedDate = useMemo(() => {
        const ts = pendingPurchase?.createdAt || Date.now();
        return new Date(ts).toLocaleString("en-US", {
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
                {/* Icon */}
                <div className={`${styles.iconWrapper} ${styles.iconError}`}>
                    <XCircleIcon />
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Payment failed</h1>
                        <p className={styles.subtitle}>
                            Your payment was not completed. No charges have been applied.
                        </p>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeError}`}>Failed</span>
                </div>

                <p className={styles.message}>
                    {reason
                        ? `Reason: ${reason}`
                        : "The payment could not be processed. This may be due to insufficient funds, a declined card, or an expired session. Please try again or use a different payment method."}
                </p>

                <div className={styles.divider} />

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
                        <span className={styles.detailValue}>Failed</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>{formattedDate}</span>
                    </div>
                    {pendingPurchase && pendingPurchase.tokens > 0 && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Selected package</span>
                            <span className={styles.detailValue}>{pendingPurchase.tokens} tokens</span>
                        </div>
                    )}
                    {(pendingPurchase?.currency || pendingPurchase?.uiCurrency) && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Currency / Amount</span>
                            <span className={styles.detailValue}>
                                {pendingPurchase.uiAmount ?? pendingPurchase.amount ?? "—"}{" "}
                                {pendingPurchase.uiCurrency || pendingPurchase.currency || ""}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.divider} />

                {/* Actions */}
                <div className={styles.actions}>
                    <a className={styles.primaryBtn} href="/pricing">
                        Try again
                    </a>
                    <a className={styles.secondaryBtn} href="/contact-us">
                        Contact support
                    </a>
                    <a className={styles.secondaryBtn} href="/dashboard">
                        Go to dashboard
                    </a>
                </div>
            </section>
        </main>
    );
}

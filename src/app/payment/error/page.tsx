"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import styles from "../success/PaymentSuccess.module.scss";

const XCircleIcon = () => (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

export default function PaymentErrorPage() {
    const sp = useSearchParams();
    const cpi = sp.get("cpi") || sp.get("id") || sp.get("invoice_id") || "—";
    const ref = sp.get("ref") || "—";
    const reason = sp.get("reason") || sp.get("error") || "";

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
                        <span className={styles.detailValueMono}>{cpi}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Reference ID</span>
                        <span className={styles.detailValueMono}>{ref}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Status</span>
                        <span className={styles.detailValue}>Failed</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>
                            {new Date().toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
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

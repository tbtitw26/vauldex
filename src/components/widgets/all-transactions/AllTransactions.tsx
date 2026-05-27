"use client";
import React, { useEffect, useState } from "react";
import styles from "./AllTransactions.module.scss";

interface Transaction {
    _id: string;
    amount: number;
    type: "add" | "spend";
    balanceAfter: number;
    createdAt: string;
}

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/transactions/get-all", { credentials: "include" });
            const data = await res.json();
            if (res.ok) setTransactions(data.transactions);
        })();
    }, []);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <section className={styles.transactionsSection}>
            <h3 className={styles.title}>Transaction History</h3>
            {transactions.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>💸</span>
                    <p>No transactions yet.</p>
                </div>
            ) : (
                <div className={styles.transactionsList}>
                    {transactions.map((t) => (
                        <div
                            key={t._id}
                            className={`${styles.transactionCard} ${
                                t.type === "add" ? styles.add : styles.spend
                            }`}
                        >
                            <div className={styles.row}>
                                <span className={styles.amount}>
                                    {t.type === "add" ? "+" : "-"}
                                    {t.amount} tokens
                                </span>
                                <span className={styles.badge}>
                                    {t.type === "add" ? "Top-up" : "Spend"}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.date}>{formatDate(t.createdAt)}</span>
                                <span className={styles.balance}>
                                    Balance: {t.balanceAfter}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

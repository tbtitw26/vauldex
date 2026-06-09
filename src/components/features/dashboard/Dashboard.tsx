"use client";

import React, { useState } from "react";
import AllOrders from "@/components/widgets/all-orders/AllOrders";
import CareerDocOrdersSection from "@/components/widgets/career-doc-orders/CareerDocOrders";
import TransactionHistory from "@/components/widgets/all-transactions/AllTransactions";
import styles from "./Dashboard.module.scss";

const TABS = [
    { key: "cv", label: "CV Orders" },
    { key: "career", label: "Career Documents" },
    { key: "transactions", label: "Transactions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<TabKey>("cv");

    return (
        <div className={styles.dashboard}>
            <div className={styles.tabs}>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === "cv" && <AllOrders />}
                {activeTab === "career" && <CareerDocOrdersSection />}
                {activeTab === "transactions" && <TransactionHistory />}
            </div>
        </div>
    );
}

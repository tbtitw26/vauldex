"use client";

import React from "react";
import { useAllOrders } from "@/context/AllOrdersContext";
import styles from "../all-orders/AllOrders.module.scss";
import { FaFileDownload } from "react-icons/fa";
import ButtonUI from "@/components/ui/button/ButtonUI";
import Link from "next/link";
import { downloadCareerDocPDF } from "@/components/features/pdf-extractor/PDFExtractorCareerDoc";
import { CareerDocOrderType, CareerDocType } from "@/backend/types/careerDoc.types";

const DOC_LABELS: Record<CareerDocType, string> = {
    recommendationLetter: "Recommendation Letter",
    thankYouEmail: "Thank You Email",
    interviewPrep: "Interview Prep Kit",
    portfolioBio: "Portfolio & Bio",
    salaryNegotiation: "Salary Negotiation",
    careerRoadmap: "Career Roadmap",
};

const DOC_COSTS: Record<CareerDocType, number> = {
    recommendationLetter: 20,
    thankYouEmail: 10,
    interviewPrep: 20,
    portfolioBio: 25,
    salaryNegotiation: 15,
    careerRoadmap: 20,
};

const CareerDocOrdersSection: React.FC = () => {
    const { careerDocOrders } = useAllOrders();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return (
            date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }) +
            " " +
            date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const formatId = (id: string) => id.slice(-6);

    const handleDownload = async (order: CareerDocOrderType) => {
        try {
            if (order.response) {
                await downloadCareerDocPDF(order);
                return;
            }

            const res = await fetch(`/api/career-doc/get-order?id=${order._id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data?.order) {
                await downloadCareerDocPDF(data.order);
            }
        } catch (err: any) {
            console.error("Error downloading career doc:", err.message);
        }
    };

    return (
        <div className={styles.ordersSection}>
            <h3 className={styles.title}>Your Career Documents</h3>

            {careerDocOrders.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📄</span>
                    <p>No career documents yet.</p>
                    <Link href="/career-services">
                        <ButtonUI
                            color="primary"
                            size="md"
                            shape="rounded"
                            textColor="quaternary"
                            hoverEffect="shadow"
                            fullWidth
                        >
                            Generate your first document
                        </ButtonUI>
                    </Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {careerDocOrders.map((order) => (
                        <div key={order._id.toString()} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <span className={styles.orderId}>#{formatId(order._id.toString())}</span>
                                <span className={styles.charge}>
                                    -{DOC_COSTS[order.docType] || 0} tokens
                                </span>
                            </div>
                            <p className={styles.email}>
                                {DOC_LABELS[order.docType] || order.docType}
                            </p>
                            <p className={styles.date}>{formatDate(order.createdAt.toString())}</p>
                            <button
                                className={styles.downloadBtn}
                                onClick={() => handleDownload(order)}
                            >
                                <FaFileDownload /> Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CareerDocOrdersSection;

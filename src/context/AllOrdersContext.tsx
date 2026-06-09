"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CVOrderType } from "@/backend/types/cv.types";
import { CareerDocOrderType } from "@/backend/types/careerDoc.types";

export interface AiOrder {
    _id: string;
    userId: string;
    email: string;
    prompt: string;
    response: string;
    createdAt: string;
}

interface AllOrdersContextType {
    aiOrders: AiOrder[];
    cvOrders: CVOrderType[];
    careerDocOrders: CareerDocOrderType[];
    refreshOrders: () => Promise<void>;
    loading: boolean;
}

const AllOrdersContext = createContext<AllOrdersContextType>({
    aiOrders: [],
    cvOrders: [],
    careerDocOrders: [],
    refreshOrders: async () => {},
    loading: false,
});

export const useAllOrders = () => useContext(AllOrdersContext);

export const AllOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [aiOrders, setAiOrders] = useState<AiOrder[]>([]);
    const [cvOrders, setCvOrders] = useState<CVOrderType[]>([]);
    const [careerDocOrders, setCareerDocOrders] = useState<CareerDocOrderType[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const resCv = await fetch("/api/cv/get-all-orders", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const dataCv = await resCv.json();
            const normalizedCv = Array.isArray(dataCv) ? dataCv : dataCv.orders;
            setCvOrders(Array.isArray(normalizedCv) ? normalizedCv : []);

            const resAi = await fetch("/api/ai/get-all-orders", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }).catch(() => null);
            if (resAi) {
                const dataAi = await resAi.json();
                const normalizedAi = Array.isArray(dataAi) ? dataAi : dataAi.orders;
                setAiOrders(Array.isArray(normalizedAi) ? normalizedAi : []);
            }

            const resCareerDoc = await fetch("/api/career-doc/get-all-orders", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }).catch(() => null);
            if (resCareerDoc) {
                const dataCareerDoc = await resCareerDoc.json();
                const normalizedCareerDoc = Array.isArray(dataCareerDoc) ? dataCareerDoc : dataCareerDoc.orders;
                setCareerDocOrders(Array.isArray(normalizedCareerDoc) ? normalizedCareerDoc : []);
            }
        } catch (err: any) {
            console.error("❌ [AllOrdersContext] Error fetching orders:", err.message);
            setAiOrders([]);
            setCvOrders([]);
            setCareerDocOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <AllOrdersContext.Provider value={{ aiOrders, cvOrders, careerDocOrders, refreshOrders: fetchOrders, loading }}>
            {children}
        </AllOrdersContext.Provider>
    );
};

"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { CareerDocOrderType, CareerDocType } from "@/backend/types/careerDoc.types";

const cleanMarkdown = (text: string) =>
    text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/```[a-z]*\n?/g, "")
        .replace(/```/g, "");

const renderLines = (text: string, style: any) =>
    text
        .split(/\n/)
        .filter((t) => t.trim())
        .map((p, i) => {
            const trimmed = p.trim();
            const isBullet = /^[-•●]\s/.test(trimmed);
            const isNumbered = /^\d+[\.\)]\s/.test(trimmed);
            const isHeading = /^#{1,3}\s/.test(trimmed) || trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60;

            if (isHeading) {
                return (
                    <Text key={i} style={{ ...style, fontWeight: "bold", fontSize: 13, marginTop: 14, marginBottom: 6, color: "#1F2937" }}>
                        {trimmed.replace(/^#{1,3}\s/, "")}
                    </Text>
                );
            }
            if (isBullet || isNumbered) {
                return (
                    <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
                        <Text style={{ ...style, width: 14 }}>{isBullet ? "•" : trimmed.match(/^\d+[\.\)]/)?.[0] || "•"}</Text>
                        <Text style={{ ...style, flex: 1 }}>{trimmed.replace(/^[-•●]\s|^\d+[\.\)]\s/, "")}</Text>
                    </View>
                );
            }
            return <Text key={i} style={style}>{trimmed}</Text>;
        });

// ─── RECOMMENDATION LETTER ─── formal letter on "letterhead"
const RecommendationLetterPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" }}>
            {/* Letterhead band */}
            <View style={{ backgroundColor: "#1E3A5F", padding: "28px 45px 20px", marginBottom: 0 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", letterSpacing: 1 }}>
                    LETTER OF RECOMMENDATION
                </Text>
                <Text style={{ fontSize: 10, color: "#93C5FD", marginTop: 4 }}>
                    Prepared for {order.fullName} — {order.industry} Professional
                </Text>
            </View>

            {/* Gold accent line */}
            <View style={{ height: 3, backgroundColor: "#D4A853" }} />

            <View style={{ padding: "30px 45px 45px" }}>
                {/* Meta info */}
                {(order.targetCompany || order.targetPosition) && (
                    <View style={{ marginBottom: 20, padding: 14, backgroundColor: "#F8FAFC", borderRadius: 6, borderLeft: "4pt solid #1E3A5F" }}>
                        {order.targetCompany && (
                            <Text style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>To: {order.targetCompany}</Text>
                        )}
                        {order.targetPosition && (
                            <Text style={{ fontSize: 10, color: "#475569" }}>Re: {order.targetPosition} Position</Text>
                        )}
                    </View>
                )}

                {/* Letter body */}
                {renderLines(cleanMarkdown(order.response || ""), {
                    fontSize: 11.5,
                    lineHeight: 1.8,
                    marginBottom: 8,
                    textAlign: "justify",
                    color: "#1F2937",
                })}

                {/* Signature area */}
                <View style={{ marginTop: 36, borderTop: "1pt solid #E2E8F0", paddingTop: 16 }}>
                    <View style={{ width: 180, borderBottom: "1pt solid #1E3A5F", marginBottom: 6, height: 30 }} />
                    <Text style={{ fontSize: 10, color: "#64748B", fontStyle: "italic" }}>Signature & Date</Text>
                </View>
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

// ─── THANK YOU EMAIL ─── clean email-style layout
const ThankYouEmailPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#F0FDF4" }}>
            {/* Green header */}
            <View style={{ backgroundColor: "#065F46", padding: "24px 45px 18px" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>
                    POST-INTERVIEW FOLLOW-UP
                </Text>
                <Text style={{ fontSize: 10, color: "#6EE7B7", marginTop: 3 }}>
                    From {order.fullName}
                </Text>
            </View>
            <View style={{ height: 2, backgroundColor: "#34D399" }} />

            <View style={{ padding: "28px 45px 45px" }}>
                {/* Email meta box */}
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 16, marginBottom: 22, border: "1pt solid #D1FAE5" }}>
                    <View style={{ flexDirection: "row", marginBottom: 4 }}>
                        <Text style={{ fontSize: 9, color: "#6B7280", width: 55 }}>To:</Text>
                        <Text style={{ fontSize: 9, color: "#111827", fontWeight: "bold" }}>{order.targetCompany || "Hiring Manager"}</Text>
                    </View>
                    {order.targetPosition && (
                        <View style={{ flexDirection: "row", marginBottom: 4 }}>
                            <Text style={{ fontSize: 9, color: "#6B7280", width: 55 }}>Position:</Text>
                            <Text style={{ fontSize: 9, color: "#111827" }}>{order.targetPosition}</Text>
                        </View>
                    )}
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontSize: 9, color: "#6B7280", width: 55 }}>Industry:</Text>
                        <Text style={{ fontSize: 9, color: "#111827" }}>{order.industry} • {order.experienceLevel}</Text>
                    </View>
                </View>

                {/* Email body */}
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 24, border: "1pt solid #E5E7EB" }}>
                    {renderLines(cleanMarkdown(order.response || ""), {
                        fontSize: 11,
                        lineHeight: 1.75,
                        marginBottom: 7,
                        color: "#1F2937",
                    })}
                </View>

                <View style={{ marginTop: 20, textAlign: "center" }}>
                    <Text style={{ fontSize: 9, color: "#6B7280", fontStyle: "italic" }}>
                        Tip: Customize the details above before sending. Send within 24 hours of your interview.
                    </Text>
                </View>
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

// ─── INTERVIEW PREP KIT ─── structured study-guide layout
const InterviewPrepPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#FAFAFE" }}>
            {/* Purple header */}
            <View style={{ backgroundColor: "#4C1D95", padding: "24px 45px 18px" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", letterSpacing: 0.5 }}>
                    INTERVIEW PREPARATION KIT
                </Text>
                <Text style={{ fontSize: 10, color: "#C4B5FD", marginTop: 3 }}>
                    Tailored for {order.fullName} — {order.experienceLevel} {order.industry}
                </Text>
            </View>
            <View style={{ height: 3, backgroundColor: "#8B5CF6" }} />

            <View style={{ padding: "24px 45px 45px" }}>
                {/* Target info chips */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {order.targetCompany && (
                        <View style={{ backgroundColor: "#EDE9FE", borderRadius: 20, padding: "6px 14px" }}>
                            <Text style={{ fontSize: 9, color: "#5B21B6", fontWeight: "bold" }}>Company: {order.targetCompany}</Text>
                        </View>
                    )}
                    {order.targetPosition && (
                        <View style={{ backgroundColor: "#EDE9FE", borderRadius: 20, padding: "6px 14px" }}>
                            <Text style={{ fontSize: 9, color: "#5B21B6", fontWeight: "bold" }}>Role: {order.targetPosition}</Text>
                        </View>
                    )}
                    <View style={{ backgroundColor: "#EDE9FE", borderRadius: 20, padding: "6px 14px" }}>
                        <Text style={{ fontSize: 9, color: "#5B21B6", fontWeight: "bold" }}>{order.industry} • {order.experienceLevel}</Text>
                    </View>
                </View>

                {/* Content */}
                {renderLines(cleanMarkdown(order.response || ""), {
                    fontSize: 11,
                    lineHeight: 1.7,
                    marginBottom: 6,
                    color: "#1F2937",
                })}
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

// ─── PORTFOLIO BIO ─── modern, creative layout with accent sidebar marker
const PortfolioBioPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" }}>
            {/* Bold red/coral header */}
            <View style={{ backgroundColor: "#7F1D1D", padding: "28px 45px 22px" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: "#FFFFFF", letterSpacing: 0.8 }}>
                    {order.fullName}
                </Text>
                <Text style={{ fontSize: 11, color: "#FCA5A5", marginTop: 4 }}>
                    {order.experienceLevel} {order.industry} Professional
                </Text>
            </View>
            <View style={{ height: 3, backgroundColor: "#EF4444" }} />

            <View style={{ padding: "28px 45px 45px", flexDirection: "row" }}>
                {/* Accent sidebar */}
                <View style={{ width: 4, backgroundColor: "#FCA5A5", borderRadius: 2, marginRight: 20 }} />

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
                        Personal Brand Content Package
                    </Text>

                    {renderLines(cleanMarkdown(order.response || ""), {
                        fontSize: 11,
                        lineHeight: 1.75,
                        marginBottom: 7,
                        color: "#1F2937",
                    })}
                </View>
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

// ─── SALARY NEGOTIATION ─── bold, amber/dark strategic document
const SalaryNegotiationPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#FFFBEB" }}>
            {/* Dark amber header */}
            <View style={{ backgroundColor: "#78350F", padding: "24px 45px 18px" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", letterSpacing: 0.5 }}>
                    SALARY NEGOTIATION STRATEGY
                </Text>
                <Text style={{ fontSize: 10, color: "#FCD34D", marginTop: 3 }}>
                    Prepared for {order.fullName}
                </Text>
            </View>
            <View style={{ height: 3, backgroundColor: "#F59E0B" }} />

            <View style={{ padding: "24px 45px 45px" }}>
                {/* Key context */}
                <View style={{ backgroundColor: "#FFFFFF", borderRadius: 8, padding: 14, marginBottom: 20, border: "1pt solid #FDE68A", flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                    {order.targetPosition && (
                        <View>
                            <Text style={{ fontSize: 8, color: "#92400E", textTransform: "uppercase", letterSpacing: 1 }}>Position</Text>
                            <Text style={{ fontSize: 11, color: "#1F2937", fontWeight: "bold", marginTop: 2 }}>{order.targetPosition}</Text>
                        </View>
                    )}
                    {order.targetCompany && (
                        <View>
                            <Text style={{ fontSize: 8, color: "#92400E", textTransform: "uppercase", letterSpacing: 1 }}>Company</Text>
                            <Text style={{ fontSize: 11, color: "#1F2937", fontWeight: "bold", marginTop: 2 }}>{order.targetCompany}</Text>
                        </View>
                    )}
                    {order.region && (
                        <View>
                            <Text style={{ fontSize: 8, color: "#92400E", textTransform: "uppercase", letterSpacing: 1 }}>Market</Text>
                            <Text style={{ fontSize: 11, color: "#1F2937", fontWeight: "bold", marginTop: 2 }}>{order.region}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={{ fontSize: 8, color: "#92400E", textTransform: "uppercase", letterSpacing: 1 }}>Level</Text>
                        <Text style={{ fontSize: 11, color: "#1F2937", fontWeight: "bold", marginTop: 2 }}>{order.experienceLevel} {order.industry}</Text>
                    </View>
                </View>

                {/* Confidential badge */}
                <View style={{ backgroundColor: "#FEF3C7", borderRadius: 4, padding: "4px 10px", alignSelf: "flex-start", marginBottom: 16 }}>
                    <Text style={{ fontSize: 8, color: "#92400E", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 }}>Confidential</Text>
                </View>

                {renderLines(cleanMarkdown(order.response || ""), {
                    fontSize: 11,
                    lineHeight: 1.7,
                    marginBottom: 6,
                    color: "#1F2937",
                })}
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

// ─── CAREER ROADMAP ─── teal/cyan strategic planning document
const CareerRoadmapPDF = (order: CareerDocOrderType) => (
    <Document>
        <Page size="A4" style={{ padding: 0, fontFamily: "Helvetica", backgroundColor: "#F0FDFA" }}>
            {/* Teal header with timeline motif */}
            <View style={{ backgroundColor: "#134E4A", padding: "24px 45px 18px" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF", letterSpacing: 0.5 }}>
                    CAREER DEVELOPMENT ROADMAP
                </Text>
                <Text style={{ fontSize: 10, color: "#5EEAD4", marginTop: 3 }}>
                    {order.fullName} — {order.experienceLevel} {order.industry}
                </Text>
            </View>
            <View style={{ height: 3, backgroundColor: "#14B8A6" }} />

            <View style={{ padding: "24px 45px 45px", flexDirection: "row" }}>
                {/* Timeline accent line */}
                <View style={{ width: 3, backgroundColor: "#99F6E4", borderRadius: 2, marginRight: 18 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#14B8A6", marginLeft: -3, marginTop: 8 }} />
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#14B8A6", marginLeft: -3, marginTop: 120 }} />
                    <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#14B8A6", marginLeft: -3, marginTop: 120 }} />
                </View>

                <View style={{ flex: 1 }}>
                    {/* Goal box */}
                    {order.targetPosition && (
                        <View style={{ backgroundColor: "#CCFBF1", borderRadius: 8, padding: 12, marginBottom: 18 }}>
                            <Text style={{ fontSize: 8, color: "#0F766E", textTransform: "uppercase", letterSpacing: 1 }}>Career Goal</Text>
                            <Text style={{ fontSize: 12, color: "#134E4A", fontWeight: "bold", marginTop: 3 }}>{order.targetPosition}</Text>
                        </View>
                    )}

                    {renderLines(cleanMarkdown(order.response || ""), {
                        fontSize: 11,
                        lineHeight: 1.7,
                        marginBottom: 6,
                        color: "#1F2937",
                    })}
                </View>
            </View>

            <Text style={{ position: "absolute", bottom: 20, left: 0, right: 0, fontSize: 8, textAlign: "center", color: "#94A3B8" }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
    </Document>
);

const PDF_BUILDERS: Record<CareerDocType, (order: CareerDocOrderType) => React.JSX.Element> = {
    recommendationLetter: RecommendationLetterPDF,
    thankYouEmail: ThankYouEmailPDF,
    interviewPrep: InterviewPrepPDF,
    portfolioBio: PortfolioBioPDF,
    salaryNegotiation: SalaryNegotiationPDF,
    careerRoadmap: CareerRoadmapPDF,
};

export async function downloadCareerDocPDF(order: CareerDocOrderType) {
    const builder = PDF_BUILDERS[order.docType];
    const doc = builder ? builder(order) : RecommendationLetterPDF(order);
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.docType}-${order._id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}

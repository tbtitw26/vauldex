"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Textarea from "@mui/joy/Textarea";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import ButtonUI from "@/components/ui/button/ButtonUI";
import styles from "../manual-generator/ManualGenerator.module.scss";
import { useAlert } from "@/context/AlertContext";
import { useUser } from "@/context/UserContext";
import { CareerDocType } from "@/backend/types/careerDoc.types";

const DOC_OPTIONS: { value: CareerDocType; label: string; cost: number; description: string }[] = [
    {
        value: "recommendationLetter",
        label: "Recommendation Letter",
        cost: 20,
        description: "A professional recommendation letter from a former manager, tailored to a specific company and position.",
    },
    {
        value: "thankYouEmail",
        label: "Thank You Email",
        cost: 10,
        description: "A warm post-interview follow-up email that reinforces your candidacy.",
    },
    {
        value: "interviewPrep",
        label: "Interview Prep Kit",
        cost: 20,
        description: "Top interview questions for your role with recommended answers based on your experience.",
    },
    {
        value: "portfolioBio",
        label: "Portfolio & Bio",
        cost: 25,
        description: "Complete personal website content: hero tagline, bio, services, project descriptions.",
    },
    {
        value: "salaryNegotiation",
        label: "Salary Negotiation Script",
        cost: 15,
        description: "Actionable negotiation strategy with scripts for different offer scenarios.",
    },
    {
        value: "careerRoadmap",
        label: "Career Roadmap",
        cost: 20,
        description: "A 1-3-5 year career development plan with skills to acquire and milestones.",
    },
];

const SHOWS_TARGET_COMPANY: CareerDocType[] = ["recommendationLetter", "thankYouEmail", "interviewPrep", "salaryNegotiation"];
const SHOWS_TARGET_POSITION: CareerDocType[] = ["recommendationLetter", "thankYouEmail", "interviewPrep", "salaryNegotiation", "careerRoadmap"];
const SHOWS_REGION: CareerDocType[] = ["salaryNegotiation"];

interface FormValues {
    docType: CareerDocType;
    fullName: string;
    industry: string;
    experienceLevel: string;
    summary: string;
    workExperience: string;
    skills: string;
    targetCompany: string;
    targetPosition: string;
    region: string;
    extraContext: string;
}

const schema = Yup.object().shape({
    docType: Yup.string().required("Required"),
    fullName: Yup.string().required("Required"),
    industry: Yup.string().required("Required"),
    experienceLevel: Yup.string().required("Required"),
    summary: Yup.string().required("Required"),
    workExperience: Yup.string().required("Required"),
    skills: Yup.string().required("Required"),
});

const MOCK_DATA: FormValues = {
    docType: "recommendationLetter",
    fullName: "John Doe",
    industry: "IT",
    experienceLevel: "Senior",
    summary:
        "Experienced full-stack developer with 7+ years building scalable web applications. Strong focus on architecture, mentoring, and delivering high-quality products.",
    workExperience: `Senior Frontend Developer at TechCorp (2021–2024)
- Led a team of 5 developers on a React/Next.js platform serving 2M users
- Reduced page load time by 40% through performance optimization
- Introduced CI/CD pipelines and code review culture

Full-Stack Developer at WebStudio (2017–2021)
- Built REST APIs with Node.js and PostgreSQL
- Migrated legacy jQuery app to React, improving developer velocity by 60%`,
    skills: "JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, MongoDB, AWS, Docker, Team Leadership",
    targetCompany: "Spotify",
    targetPosition: "Staff Frontend Engineer",
    region: "Western Europe",
    extraContext: "Looking to transition into a more architectural and leadership-focused role.",
};

const CareerDocGenerator = () => {
    const { showAlert } = useAlert();
    const user = useUser();
    const [loading, setLoading] = useState(false);

    const initialValues: FormValues = {
        docType: "recommendationLetter",
        fullName: "",
        industry: "IT",
        experienceLevel: "Mid-level",
        summary: "",
        workExperience: "",
        skills: "",
        targetCompany: "",
        targetPosition: "",
        region: "",
        extraContext: "",
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={async (values) => {
                setLoading(true);
                try {
                    const res = await fetch("/api/career-doc/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(values),
                    });

                    const data = await res.json();
                    if (res.ok) {
                        const docLabel = DOC_OPTIONS.find((d) => d.value === values.docType)?.label || "Document";
                        showAlert(
                            "Success",
                            `Your ${docLabel} has been generated successfully and is ready to download.`,
                            "success"
                        );
                    } else {
                        showAlert("Error", data.message || "Failed to generate document", "error");
                    }
                } catch (e) {
                    showAlert("Error", "Network or server error", "error");
                }
                setLoading(false);
            }}
        >
            {({ values, setFieldValue, setValues }) => {
                const selectedDoc = DOC_OPTIONS.find((d) => d.value === values.docType);
                const cost = selectedDoc?.cost || 0;

                return (
                    <Form className={styles.form}>
                        {/* Document Type */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Select Document Type</h3>
                            <Select
                                value={values.docType}
                                onChange={(_, v) => setFieldValue("docType", v as CareerDocType)}
                                className={styles.inputBase}
                            >
                                {DOC_OPTIONS.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>
                                        {opt.label} ({opt.cost} tokens)
                                    </Option>
                                ))}
                            </Select>
                            {selectedDoc && (
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                                    {selectedDoc.description}
                                </p>
                            )}
                        </div>

                        {/* Personal Info */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Personal Info</h3>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Full Name</label>
                                <Field name="fullName" as={Input} placeholder="John Doe" className={styles.inputBase} />
                            </div>
                            <div className={styles.selectGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Industry</label>
                                    <Select
                                        value={values.industry}
                                        onChange={(_, v) => setFieldValue("industry", v)}
                                        className={styles.inputBase}
                                    >
                                        {["IT", "Marketing", "Finance", "Design", "Education", "Healthcare", "Other"].map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Experience Level</label>
                                    <Select
                                        value={values.experienceLevel}
                                        onChange={(_, v) => setFieldValue("experienceLevel", v)}
                                        className={styles.inputBase}
                                    >
                                        {["Junior", "Mid-level", "Senior", "Lead"].map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Target Details (conditional) */}
                        {(SHOWS_TARGET_COMPANY.includes(values.docType) ||
                            SHOWS_TARGET_POSITION.includes(values.docType) ||
                            SHOWS_REGION.includes(values.docType)) && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Target Details</h3>
                                {SHOWS_TARGET_COMPANY.includes(values.docType) && (
                                    <div className={styles.fullWidth}>
                                        <label className={styles.label}>Target Company (optional)</label>
                                        <Field
                                            name="targetCompany"
                                            as={Input}
                                            placeholder="e.g. Google, Spotify"
                                            className={styles.inputBase}
                                        />
                                    </div>
                                )}
                                {SHOWS_TARGET_POSITION.includes(values.docType) && (
                                    <div className={styles.fullWidth}>
                                        <label className={styles.label}>Target Position (optional)</label>
                                        <Field
                                            name="targetPosition"
                                            as={Input}
                                            placeholder="e.g. Senior Frontend Developer"
                                            className={styles.inputBase}
                                        />
                                    </div>
                                )}
                                {SHOWS_REGION.includes(values.docType) && (
                                    <div className={styles.fullWidth}>
                                        <label className={styles.label}>Region / Market</label>
                                        <Field
                                            name="region"
                                            as={Input}
                                            placeholder="e.g. Western Europe, US East Coast"
                                            className={styles.inputBase}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Professional Background */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Professional Background</h3>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Professional Summary</label>
                                <Field
                                    name="summary"
                                    as={Textarea}
                                    minRows={3}
                                    placeholder="Brief overview of your career and strengths..."
                                    className={styles.inputBase}
                                />
                            </div>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Work Experience</label>
                                <Field
                                    name="workExperience"
                                    as={Textarea}
                                    minRows={4}
                                    placeholder="Key roles, responsibilities, and achievements..."
                                    className={styles.inputBase}
                                />
                            </div>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Skills</label>
                                <Field
                                    name="skills"
                                    as={Textarea}
                                    minRows={2}
                                    placeholder="JavaScript, React, Leadership, Project Management..."
                                    className={styles.inputBase}
                                />
                            </div>
                            <div className={styles.fullWidth}>
                                <label className={styles.label}>Additional Context (optional)</label>
                                <Field
                                    name="extraContext"
                                    as={Textarea}
                                    minRows={2}
                                    placeholder="Any extra details relevant to this document..."
                                    className={styles.inputBase}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Summary</h3>
                            <p className={styles.tokenSummary}>
                                Total tokens: <strong>{cost}</strong>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className={styles.actions}>
                            <ButtonUI
                                type="button"
                                color="secondary"
                                textColor="backgroundLight"
                                variant="soft"
                                hoverEffect="shadow"
                                onClick={() => setValues(MOCK_DATA)}
                            >
                                Fill with Mock Data
                            </ButtonUI>

                            <ButtonUI
                                type="submit"
                                color="primary"
                                textColor="backgroundLight"
                                variant="solid"
                                hoverEffect="glow"
                                loading={loading}
                            >
                                Generate Document
                            </ButtonUI>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default CareerDocGenerator;

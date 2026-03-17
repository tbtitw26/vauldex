"use client";

import React from "react";
import Text from "@/components/constructor/text/Text";
import ExamplesGrid from "@/components/ui/example-grid/ExamplesGrid";
import InfoBlock from "@/components/constructor/Info-block/InfoBlock";
import ValuesIcons from "@/components/constructor/values-icons/ValuesIcons";
import HighlightStrip from "@/components/constructor/highlight-strip/HighlightStrip";
import FAQ from "@/components/constructor/faq/FAQ";
import { media as mediaMap } from "@/resources/media";
import Marquee from "@/components/constructor/marquee/Marquee";

function resolveMedia(key?: string) {
    if (!key) return undefined;
    const v = (mediaMap as Record<string, unknown>)[key];
    if (!v && process.env.NODE_ENV !== "production") {
        console.warn(`⚠️ Media not found: ${key}`);
    }
    return v as any;
}

const Page = () => {
    return (
        <>
            {/* Intro */}
            <Text
                title="Examples of CV"
                description={`Check out our CV templates. Each example can be viewed directly on the website 
                in PDF format with test data or download them for yourself. Use them as 
                inspiration for your own CV.`}
                titleLevel={1}
                centerTitle
                centerDescription
            />

            <Marquee items={[
                { text: "🚀 ATS-friendly CVs" },
                { text: "👩‍💼 Optional review support" },
                { text: "📑 Templates for different industries" },
                { text: "⚡ Instant generation" },
                { text: "🎨 Modern designs" }
            ]}/>

            {/* Основний грід прикладів */}
            <ExamplesGrid />

            {/* InfoBlock */}
            <InfoBlock
                title="Why Use Our CV Templates?"
                description="Our CV examples are designed to help you present your experience clearly. Each template is built with applicant tracking systems (ATS) compatibility in mind and adapted for different industries."
                bullets={[
                    "Professional, clean layouts",
                    "ATS-friendly formatting",
                    "Easy to edit and customize",
                ]}
                align="center"
                image={resolveMedia("image2")}
            />

            {/* 🆕 Extras Section */}
            <ValuesIcons
                title="Optional Extras for a Complete Job Application"
                description="Boost your application with additional professionally written materials you can generate along with your CV:"
                values={[
                    {
                        icon: "✉️",
                        title: "Cover Letter",
                        text: "A personalized letter written specifically for the job and company.",
                    },
                    {
                        icon: "💼",
                        title: "LinkedIn Summary",
                        text: "An optimized 'About' section to impress recruiters online.",
                    },
                    {
                        icon: "🔍",
                        title: "Keyword Optimization",
                        text: "Ensures your CV matches ATS systems and job descriptions.",
                    },
                    {
                        icon: "🧩",
                        title: "ATS Compatibility Report",
                        text: "Instant feedback on how your CV performs in applicant systems.",
                    },
                ]}
            />

            {/* Values Icons */}
            <ValuesIcons
                title="Key Benefits"
                description="When using our CV templates you get:"
                values={[
                    { icon: "⚡", title: "Speed", text: "Generate your CV in minutes" },
                    { icon: "📑", title: "ATS Safe", text: "Pass recruiter filters easily" },
                    { icon: "🎨", title: "Designs", text: "Modern layouts for all industries" },
                    { icon: "🖊️", title: "Customizable", text: "Easily edit to fit your profile" },

                ]}
            />

            {/* FAQ */}
            <FAQ
                items={[
                    {
                        question: "Can I download the CV examples?",
                        answer: "Yes, each template is available as a PDF with sample data.",
                    },
                    {
                        question: "Are the CVs ATS-friendly?",
                        answer: "Absolutely. All our templates are designed to pass applicant tracking systems.",
                    },
                    {
                        question: "Can I customize the CV?",
                        answer: "Of course! You can edit text, layout, and design to match your profile.",
                    },
                    {
                        question: "What are 'Extras'?",
                        answer:
                            "Extras are optional add-ons like Cover Letter, LinkedIn Summary, or ATS report that help you strengthen your overall application.",
                    },
                ]}
            />
        </>
    );
};

export default Page;

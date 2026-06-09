import { PageSchema } from "@/components/constructor/page-render/types";
import {COMPANY_NAME} from "@/resources/constants";

const schema: PageSchema = {
    meta: {
        title: `Pricing — ${COMPANY_NAME}`,
        description:
            `Choose the right plan for your career journey. ${COMPANY_NAME} offers instant CV generation and optional review support.`,
        keywords: [
            `${COMPANY_NAME} pricing`,
            "resume builder plans",
            "AI CV cost",
            "expert review pricing",
        ],
        canonical: "/pricing",
        ogImage: {
            title: `${COMPANY_NAME} Pricing`,
            description: "Affordable plans for instant CVs or reviewed resumes",
            bg: "#0a2540",
            color: "#ffffff",
        },
    },
    blocks: [
        // 🔹 Hero / Intro
        {
            type: "custom",
            component: "HeroSection",
            title: "Choose Your Plan",
            highlight: "Flexible Pricing",
            description:
                "Whether you need a quick CV today or a polished version tomorrow, we’ve got a plan tailored to your needs.",
            image: "image10",
        },

        // 🔹 InfoBlock перед тарифами
        {
            type: "custom",
            component: "InfoBlock",
            title: "Simple & Transparent",
            description:
                "Pick the plan that matches your career goals — all with clear pricing and no hidden fees.",
            icon: "💡",
            align: "center",
        },

        {
            type: "grid",
            columns: 2,
            gap: "2rem",
            cards: [
                {
                    type: "pricing",
                    variant: "starter",
                    title: "Starter",
                    price: "€10",
                    tokens: 1000,
                    badgeTop: "Starter Plan",
                    description: "1,000 tokens to get started.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "Career documents & letters",
                        "Interview prep & salary scripts",
                        "All templates & formats",
                        "Tokens never expire"
                    ],
                    buttonText: "Start Now",
                    buttonLink: "/checkout?plan=starter",
                },
                {
                    type: "pricing",
                    variant: "pro",
                    title: "Pro",
                    price: "€49",
                    tokens: 4900,
                    badgeTop: "Pro Plan",
                    description: "4,900 tokens — best for regular use.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "Career documents & letters",
                        "Interview prep & salary scripts",
                        "All templates & formats",
                        "Tokens never expire"
                    ],
                    buttonText: "Go Pro",
                    buttonLink: "/checkout?plan=pro",
                },
                {
                    type: "pricing",
                    variant: "premium",
                    title: "Premium",
                    price: "€99",
                    tokens: 9900,
                    badgeTop: "Recommended",
                    description: "9,900 tokens — maximum value.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "Career documents & letters",
                        "Interview prep & salary scripts",
                        "All templates & formats",
                        "Tokens never expire"
                    ],
                    buttonText: "Choose Premium",
                    buttonLink: "/checkout?plan=premium",
                },
                {
                    type: "pricing",
                    variant: "custom",
                    title: "Custom Plan",
                    price: "dynamic",
                    tokens: 0,
                    badgeTop: "Custom Plan",
                    description: "Choose your own amount.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "Career documents & letters",
                        "Interview prep & salary scripts",
                        "All templates & formats",
                        "Tokens never expire"
                    ],
                    buttonText: "Buy Custom",
                    buttonLink: "/checkout?plan=custom",
                },
            ],
        },

        // Token usage guide
        {
            type: "custom",
            component: "InfoBlock",
            title: "What Can You Do With Tokens?",
            description: "Every service uses tokens — buy once, spend on anything you need. Here’s a quick guide to token costs.",
            icon: "🪙",
            align: "center",
        },

        {
            type: "grid",
            columns: 4,
            gap: "1.5rem",
            cards: [
                {
                    title: "Instant CV",
                    description: "AI-generated professional CV with your choice of template.",
                    buttonText: "30 tokens",
                    buttonLink: "/dashboard",
                },
                {
                    title: "Manager Review CV",
                    description: "Expert-refined CV delivered within 24 hours.",
                    buttonText: "60 tokens",
                    buttonLink: "/dashboard",
                },
                {
                    title: "Recommendation Letter",
                    description: "Formal letter from a manager’s perspective.",
                    buttonText: "20 tokens",
                    buttonLink: "/career-services",
                },
                {
                    title: "Interview Prep Kit",
                    description: "Role-specific questions with tailored answers.",
                    buttonText: "20 tokens",
                    buttonLink: "/career-services",
                },
                {
                    title: "Portfolio & Bio",
                    description: "Personal website content package.",
                    buttonText: "25 tokens",
                    buttonLink: "/career-services",
                },
                {
                    title: "Salary Negotiation",
                    description: "Negotiation scripts with market data.",
                    buttonText: "15 tokens",
                    buttonLink: "/career-services",
                },
                {
                    title: "Career Roadmap",
                    description: "1-3-5 year career development plan.",
                    buttonText: "20 tokens",
                    buttonLink: "/career-services",
                },
                {
                    title: "Thank You Email",
                    description: "Post-interview follow-up email.",
                    buttonText: "10 tokens",
                    buttonLink: "/career-services",
                },
            ],
        },

        {
            type: "section",
            left: {
                type: "custom",
                component: "InfoBlock",
                title: "Why Upgrade?",
                description:
                    "More tokens means more documents — CVs, letters, interview prep, salary scripts, and career roadmaps. One balance powers your entire job search.",
                bullets: [
                    "Instant download in PDF format",
                    "Optional manual CV review",
                    "ATS-friendly formatting",
                    "Full career document suite",
                ],
            },
            right: {
                type: "media",
                mediaType: "image",
                src: "image4",
                alt: "Professional CV Example",
            },
        },

        {
            type: "faq",
            items: [
                {
                    question: "Can I really get my CV instantly?",
                    answer:
                        "Yes, with our AI-powered generator you can download your CV immediately after filling in your details.",
                },
                {
                    question: "What’s included in the HR review?",
                    answer:
                        "The review focuses on structure, keywords, formatting, and overall clarity to help strengthen your CV.",
                },
                {
                    question: "Can I upgrade later?",
                    answer:
                        "Of course! You can start with the Starter plan and upgrade to Pro or Premium whenever you want.",
                },
                {
                    question: "Can I use tokens for career documents too?",
                    answer:
                        "Yes! The same tokens work for all services — CVs, recommendation letters, interview prep kits, salary negotiation scripts, portfolio bios, and career roadmaps.",
                },
                {
                    question: "Do tokens expire?",
                    answer:
                        "No. Tokens never expire. Buy once and use them whenever you need a new document.",
                },
            ],
        },
    ],
};

export default schema;

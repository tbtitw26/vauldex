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
                        "All templates & formats",
                        "Tokens never expire"
                    ],
                    buttonText: "Buy Custom",
                    buttonLink: "/checkout?plan=custom",
                },
            ],
        },

        // 🔹 Section з текстом і фото
        {
            type: "section",
            left: {
                type: "custom",
                component: "InfoBlock",
                title: "Why Upgrade?",
                description:
                    "A reviewed CV can help improve clarity, structure, and presentation for your applications.",
                bullets: [
                    "Instant download in multiple formats",
                    "Optional manual review",
                    "ATS-friendly formatting",
                ],
            },
            right: {
                type: "media",
                mediaType: "image",
                src: "image4",
                alt: "Professional CV Example",
            },
        },

        // 🔹 FAQ в кінці
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
                        "Of course! You can start with the Basic plan and upgrade to Pro or Premium whenever you want.",
                },
            ],
        },
    ],
};

export default schema;

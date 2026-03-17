import { PageSchema } from "@/components/constructor/page-render/types";
import { COMPANY_NAME, COMPANY_EMAIL } from "@/resources/constants";

const faqSchema: PageSchema = {
    meta: {
        title: `FAQ — ${COMPANY_NAME}`,
        description: `Frequently Asked Questions about ${COMPANY_NAME}: instant CV builder, optional expert review in 24h, revisions, and professional career support.`,
        keywords: [
            `${COMPANY_NAME} FAQ`,
            "resume builder",
            "instant cv",
            "ATS resume",
            "career support",
            "cv review support",
        ],
        canonical: "/faq",
        ogImage: {
            title: `${COMPANY_NAME} FAQ`,
            description: `Answers to the most common questions about creating your CV with ${COMPANY_NAME}.`,
            bg: "#0a2540",
            color: "#ffffff",
        },
    },
    blocks: [
        {
            type: "faq",
            items: [
                {
                    question: `What is ${COMPANY_NAME}?`,
                    answer: `${COMPANY_NAME} is a CV builder that lets you instantly generate an ATS-friendly resume. You can also choose our optional Manager Review service for additional refinement delivered within 24 hours.`,
                },
                {
                    question: "How long does it take to receive my resume?",
                    answer: `If you use the instant builder, you can download your CV immediately. If you select the Manager Review option, your polished CV will be delivered within 24 hours.`,
                },
                {
                    question: "Who creates the resumes?",
                    answer: `Instant CVs are generated automatically using our templates. Manager-reviewed CVs receive additional manual refinement before delivery.`,
                },
                {
                    question: "Can I request revisions?",
                    answer: `Yes. If you select the Manager Review option, you can request revisions to make sure your CV perfectly matches your career goals.`,
                },
                {
                    question: "Will my resume be tailored to specific jobs?",
                    answer: `Yes. The instant builder provides a general professional CV, while the Manager Review option ensures it’s tailored to your target role, industry, and career objectives.`,
                },
                {
                    question: "Do you also design the resume layout?",
                    answer: `Yes. All CVs use modern, professional layouts. Manager-reviewed resumes also get an additional polish to maximize visual impact.`,
                },
                {
                    question: "Is my data safe?",
                    answer: `Absolutely. Your personal information is processed securely and never shared with third parties.`,
                },
                {
                    question: "Can you help if I’m changing careers?",
                    answer: `Yes. The Manager Review option can help highlight transferable skills for a career transition.`,
                },
                {
                    question: "Do you offer cover letters too?",
                    answer: `Yes. Along with resumes, we also create personalized cover letters that complement your CV.`,
                },
                {
                    question: "How can I contact support?",
                    answer: `Our support team is always available at ${COMPANY_EMAIL}.`,
                },
                {
                    question: "What payment methods do you accept?",
                    answer: `We accept Visa and MasterCard.`,
                },
                {
                    question: "What is your refund policy?",
                    answer: `We offer a 30-day money-back guarantee on all purchases.`,
                },
                {
                    question: "Can I upgrade to Manager Review after using the instant builder?",
                    answer: `Yes. You can easily upgrade to the Manager Review service after generating your instant CV.`,
                },
                {
                    question: "Are there any discounts for bulk orders?",
                    answer: `Please contact our support team at ${COMPANY_EMAIL} for information on bulk order discounts.`,
                },
                {
                    question: "Do you provide career advice?",
                    answer: `Manager Review may include practical suggestions to improve how your experience is presented.`,
                }
            ],
        },
    ],
};

export default faqSchema;

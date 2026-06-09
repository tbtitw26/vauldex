import { PageSchema } from "@/components/constructor/page-render/types";
import { COMPANY_NAME, COMPANY_EMAIL } from "@/resources/constants";

const faqSchema: PageSchema = {
    meta: {
        title: `FAQ — ${COMPANY_NAME}`,
        description: `Frequently Asked Questions about ${COMPANY_NAME}: instant CV builder, career documents, interview prep, salary negotiation, and professional career support.`,
        keywords: [
            `${COMPANY_NAME} FAQ`,
            "resume builder",
            "instant cv",
            "ATS resume",
            "career support",
            "cv review support",
            "recommendation letter",
            "interview preparation",
            "salary negotiation",
            "career roadmap",
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
                    answer: `Yes! Beyond CVs, we offer career roadmaps with 1-3-5 year plans, salary negotiation scripts, and interview preparation kits — all tailored to your experience and industry.`,
                },
                {
                    question: "What career documents can I generate?",
                    answer: `We offer six types of career documents: Recommendation Letters, Thank You Emails, Interview Preparation Kits, Portfolio & Bio content, Salary Negotiation Scripts, and Career Development Roadmaps. All are AI-powered and personalized to your background.`,
                },
                {
                    question: "How does the Recommendation Letter work?",
                    answer: `Our AI generates a professional recommendation letter written from the perspective of a former manager or colleague. You can target it to a specific company and position for maximum impact.`,
                },
                {
                    question: "What is the Interview Prep Kit?",
                    answer: `It generates the most likely interview questions for your specific role and industry, along with recommended answers based on your actual work experience. It also includes questions to ask the interviewer and key talking points.`,
                },
                {
                    question: "Can I get help with salary negotiation?",
                    answer: `Yes. Our Salary Negotiation Script includes market salary analysis, opening statements, counter-offer scripts for different scenarios, key arguments, and non-salary benefits to negotiate.`,
                },
                {
                    question: "What is the Career Roadmap?",
                    answer: `It's a personalized 1-3-5 year career development plan. It analyzes your current position, identifies skill gaps, recommends certifications and courses, and maps out target roles and milestones.`,
                },
                {
                    question: "Do career documents cost the same as CVs?",
                    answer: `Career documents range from 10 to 25 tokens depending on the type. Thank You Emails are 10 tokens, while Interview Prep Kits and Career Roadmaps are 20 tokens. The same token balance works for all services.`,
                }
            ],
        },
    ],
};

export default faqSchema;

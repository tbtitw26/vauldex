import { PageSchema } from "@/components/constructor/page-render/types";
import { COMPANY_NAME } from "@/resources/constants";

const servicesSchema: PageSchema = {
    meta: {
        title: `Our Services — ${COMPANY_NAME}`,
        description: `Explore ${COMPANY_NAME} services: AI-powered CVs, recommendation letters, interview preparation, salary negotiation scripts, career roadmaps, and more.`,
        keywords: [
            `${COMPANY_NAME} services`,
            "cv builder",
            "resume generator",
            "recommendation letter",
            "interview prep",
            "salary negotiation",
            "career roadmap",
            "portfolio bio generator",
            "thank you email",
            "career services platform",
        ],
        canonical: "/services",
        ogImage: {
            title: `${COMPANY_NAME} Services`,
            description: "AI-powered CVs and career documents — everything you need to land your next role.",
            bg: "#ffffff",
            color: "#000000",
        },
    },
    blocks: [
        {
            type: "section",
            align: "center",
            left: {
                type: "text",
                title: "Everything You Need for Your Career",
                description: `${COMPANY_NAME} combines AI-powered document generation with professional templates. From CVs to interview prep and salary negotiation — all in one platform.`,
                centerTitle: true,
                centerDescription: true,
            },
        },

        {
            type: "custom",
            component: "InfoBlock",
            title: "CV Generation",
            description: "Our core service — create a professional, ATS-optimized CV in seconds or get it refined by a manager within 24 hours.",
            icon: "📄",
            align: "center",
        },

        {
            type: "grid",
            columns: 2,
            gap: "3rem",
            cards: [
                {
                    image: "image1",
                    title: "Instant AI CV",
                    description: "Fill in your details and download a polished CV immediately. Choose from Classic, Modern, or Creative templates.",
                    buttonLink: "/dashboard",
                    buttonText: "Create CV Now",
                },
                {
                    image: "image2",
                    title: "Manager Review (24h)",
                    description: "Our specialists refine your CV for clarity, structure, and recruiter appeal — delivered within 24 hours.",
                    buttonLink: "/dashboard",
                    buttonText: "Get Reviewed",
                },
            ],
        },

        {
            type: "custom",
            component: "InfoBlock",
            title: "Career Documents",
            description: "Go beyond the CV with AI-generated career documents tailored to your experience and goals.",
            icon: "🚀",
            align: "center",
        },

        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image3",
                    title: "Recommendation Letter",
                    description: "A professional recommendation from a former manager's perspective, targeted at a specific company and role.",
                    buttonLink: "/career-services",
                    buttonText: "Generate Letter",
                },
                {
                    image: "image4",
                    title: "Thank You Email",
                    description: "A warm post-interview follow-up that reinforces your qualifications and keeps you top of mind.",
                    buttonLink: "/career-services",
                    buttonText: "Write Email",
                },
                {
                    image: "image5",
                    title: "Interview Prep Kit",
                    description: "The top interview questions for your specific role, with tailored answers based on your experience.",
                    buttonLink: "/career-services",
                    buttonText: "Prepare Now",
                },
            ],
        },

        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image6",
                    title: "Portfolio & Bio Generator",
                    description: "Complete personal website content: hero tagline, professional bio, services description, and project showcases.",
                    buttonLink: "/career-services",
                    buttonText: "Build Portfolio",
                },
                {
                    image: "image7",
                    title: "Salary Negotiation Script",
                    description: "An actionable negotiation strategy with market data, counter-offer scripts, and key arguments for your level.",
                    buttonLink: "/career-services",
                    buttonText: "Get Script",
                },
                {
                    image: "image8",
                    title: "Career Roadmap",
                    description: "A 1-3-5 year development plan: target roles, skills to acquire, certifications, and networking strategy.",
                    buttonLink: "/career-services",
                    buttonText: "Plan Career",
                },
            ],
        },

        {
            type: "custom",
            component: "InfoBlock",
            title: "CV Add-ons",
            description: "Enhance your CV with optional extras that boost your chances.",
            icon: "✨",
            align: "center",
        },

        {
            type: "grid",
            columns: 4,
            gap: "2rem",
            cards: [
                {
                    image: "image9",
                    title: "Cover Letter",
                    description: "A tailored cover letter that complements your CV.",
                    buttonLink: "/dashboard",
                    buttonText: "Add to CV",
                },
                {
                    image: "image10",
                    title: "LinkedIn Summary",
                    description: "An optimized About section for your LinkedIn profile.",
                    buttonLink: "/dashboard",
                    buttonText: "Add to CV",
                },
                {
                    image: "image1",
                    title: "ATS Compatibility",
                    description: "A report on keyword optimization and recruiter readability.",
                    buttonLink: "/dashboard",
                    buttonText: "Add to CV",
                },
                {
                    image: "image2",
                    title: "Skills Gap Analysis",
                    description: "Identify missing skills and get learning recommendations.",
                    buttonLink: "/dashboard",
                    buttonText: "Add to CV",
                },
            ],
        },

        {
            type: "custom",
            component: "HighlightStrip",
            messages: [
                "📄 Professional CVs in seconds",
                "📝 Recommendation letters for any company",
                "🎯 Interview prep tailored to your role",
                "💰 Salary negotiation with market data",
                "🗺️ Career planning for 1-3-5 years",
                "🌐 Portfolio & bio for your personal brand",
            ],
        },

        {
            type: "section",
            left: {
                type: "text",
                title: "How It Works",
                description: `All our services follow the same simple process. Your professional data powers every document — fill it in once and generate as many documents as you need.`,
                bullets: [
                    "Sign up and top up your token balance",
                    "Fill in your professional background once",
                    "Choose any document type — CV, letter, prep kit, or strategy",
                    "Download your polished PDF instantly",
                ],
            },
            right: {
                type: "media",
                mediaType: "image",
                src: "image3",
                alt: "Career services workflow",
            },
        },

        {
            type: "section",
            left: {
                type: "media",
                mediaType: "image",
                src: "image4",
                alt: "Token system",
            },
            right: {
                type: "text",
                title: "Flexible Token System",
                description: "Buy tokens once and spend them on any service. No subscriptions, no hidden fees — tokens never expire.",
                bullets: [
                    "CV generation: 30–60 tokens",
                    "Recommendation Letter: 20 tokens",
                    "Interview Prep Kit: 20 tokens",
                    "Salary Negotiation Script: 15 tokens",
                    "Career Roadmap: 20 tokens",
                    "Thank You Email: 10 tokens",
                    "Portfolio & Bio: 25 tokens",
                ],
            },
        },

        {
            type: "section",
            align: "center",
            left: {
                type: "text",
                title: "Why Choose Us?",
                description: `Because your career deserves more than just a CV. ${COMPANY_NAME} gives you the tools to present yourself professionally at every stage — from application to negotiation.`,
                bullets: [
                    "AI-powered personalization for every document",
                    "Flexible pricing with tokens — pay only for what you need",
                    "All-in-one platform: CVs, letters, prep, strategy",
                ],
                centerTitle: true,
                centerDescription: true,
                centerBullets: true,
            },
        },

        {
            type: "faq",
            items: [
                {
                    question: `What services does ${COMPANY_NAME} provide?`,
                    answer: "We offer AI-powered CV generation, recommendation letters, thank-you emails, interview preparation kits, portfolio & bio content, salary negotiation scripts, and career development roadmaps.",
                },
                {
                    question: "Do I need tokens for every service?",
                    answer: "Yes, each service has a token cost ranging from 10 to 60 tokens. Buy once and spend on whatever you need — tokens never expire.",
                },
                {
                    question: "How are career documents different from CVs?",
                    answer: "CVs focus on your professional resume. Career documents cover everything else: letters, interview prep, salary negotiation, personal branding, and long-term career planning.",
                },
                {
                    question: "Can I use the same data for multiple documents?",
                    answer: "Yes. Your professional background powers all document types — fill it in once and generate any document instantly.",
                },
            ],
        },
    ],
};

export default servicesSchema;

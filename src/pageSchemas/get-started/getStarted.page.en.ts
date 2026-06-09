import {PageSchema} from "@/components/constructor/page-render/types";
import {COMPANY_NAME} from "@/resources/constants";

const schema: PageSchema = {
    meta: {
        title: `Get Started — ${COMPANY_NAME}`,
        description: `Learn how ${COMPANY_NAME} helps you create a professional CV, generate career documents, and prepare for interviews — all powered by AI.`,
        keywords: [
            `${COMPANY_NAME} get started`,
            "cv maker onboarding",
            "resume builder steps",
            "instant cv",
            "manager review cv",
            "professional cv service",
            "career documents",
            "interview preparation",
            "recommendation letter",
        ],
        canonical: "/get-started",
        ogImage: {
            title: `Get Started with ${COMPANY_NAME}`,
            description: "Instant CVs + optional expert review in 24h.",
            bg: "#0a2540",
            color: "#ffffff",
        },
    },
    blocks: [

        {
            type: "custom",
            component: "HeroSection",
            title: `Get Started with ${COMPANY_NAME}`,
            highlight: "Our Mission & Vision",
            description: `With ${COMPANY_NAME}, you can generate CVs, recommendation letters, interview prep kits, and more — all powered by AI. Choose instant generation or optional Manager Review for extra polish.`,
            image: "image5",
        },

        // 🟣 HighlightStrip
        {
            type: "custom",
            component: "HighlightStrip",
            messages: [
                "⚡ Instant CV download",
                "🎨 Professional templates",
                "👩‍💼 Optional review (24h)",
                "📑 ATS-optimized resumes",
                "📝 Recommendation letters & career docs",
                "🎯 Interview prep & salary negotiation",
                "✅ Built for modern job seekers",
            ],
        },

        // 🟣 ValuesIcons
        {
            type: "custom",
            component: "ValuesIcons",
            values: [
                {icon: "⚡", title: "Instant Results", text: "Get your CV right away after filling the form"},
                {icon: "👩‍💼", title: "Expert Option", text: "Add review support for extra refinement in 24h"},
                {icon: "📑", title: "ATS-Friendly", text: "Optimized to pass Applicant Tracking Systems"},
                {icon: "🎨", title: "Modern Templates", text: "Choose sleek, professional designs"},
                {icon: "📝", title: "Career Documents", text: "Letters, bios, negotiation scripts, and more"},
                {icon: "🎯", title: "Interview Prep", text: "Role-specific questions with tailored answers"},
            ],
        },

        // 🟣 Grid — How it works
        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image1",
                    title: "1. Sign Up",
                    description: "Create your account to start building your CV.",
                },
                {
                    image: "image2",
                    title: "2. Choose a Template",
                    description: "Select from modern, professional designs.",
                },
                {
                    image: "image3",
                    title: "3. Fill Out the Form",
                    description: "Provide your skills, education, and experience.",
                },
                {
                    image: "image4",
                    title: "4a. Instant CV",
                    description: "Download your ATS-friendly CV immediately.",
                },
                {
                    image: "image5",
                    title: "4b. Manager Review (Optional)",
                    description: "Your CV is refined and sent within 24h.",
                },
                {
                    image: "image6",
                    title: "5. Apply with Confidence",
                    description: "Use your CV to stand out and land interviews.",
                },
            ],
        },

        // Career Services Section
        {
            type: "custom",
            component: "InfoBlock",
            title: "Beyond CVs — Full Career Toolkit",
            description: "Use the same professional data to generate recommendation letters, interview prep kits, salary negotiation scripts, and more.",
            icon: "🚀",
            align: "center",
        },

        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image7",
                    title: "Recommendation Letters",
                    description: "Professional letters from a manager's perspective, tailored to your target company.",
                    buttonLink: "/career-services",
                    buttonText: "Generate Letter",
                },
                {
                    image: "image8",
                    title: "Interview Prep Kit",
                    description: "Top questions for your role with recommended answers based on your experience.",
                    buttonLink: "/career-services",
                    buttonText: "Prepare Now",
                },
                {
                    image: "image9",
                    title: "Salary Negotiation",
                    description: "Data-driven scripts for different offer scenarios with market analysis.",
                    buttonLink: "/career-services",
                    buttonText: "Get Script",
                },
            ],
        },

        // Final CTA
        {
            type: "section",
            align: "center",
            left: {
                type: "text",
                title: "Start Your Career the Right Way",
                description:
                    `Sign up today, fill in your details, and generate any career document — CVs, letters, interview prep, and strategy guides — all from one platform.`,
                centerTitle: true,
                centerDescription: true,
            },
        },

        // 🟣 FAQ
        {
            type: "faq",
            items: [
                {
                    question: "How fast will I get my CV?",
                    answer: "Instantly if you use the automatic builder. If you choose Manager Review, you’ll receive the polished CV within 24 hours.",
                },
                {
                    question: "Can I try multiple templates?",
                    answer: "Yes. You can preview and switch templates before downloading.",
                },
                {
                    question: "Do I need design skills?",
                    answer: "Not at all. Everything is handled automatically, and if you choose review, your CV receives additional polish in design and content.",
                },
                {
                    question: "Is it ATS-friendly?",
                    answer: "Yes. Both instant and reviewed CVs are designed with ATS-friendly formatting in mind.",
                },
            ],
        },
    ],
};

export default schema;
